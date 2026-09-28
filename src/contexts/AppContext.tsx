import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, Job, Message, AppState } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface AppContextType extends AppState {
  sessionReady: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => Promise<void>;
  acceptJob: (jobId: string, providerId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: Job['status'], photos?: string[]) => Promise<void>;
  submitRating: (jobId: string, rating: number, review: string) => Promise<void>;
  sendMessage: (jobId: string, recipientId: string, body: string) => Promise<void>;
  markMessageRead: (messageId: string) => Promise<void>;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  clearValidationStatus: () => Promise<void>;
}

const defaultAppContext: AppContextType = {
  currentUser: null,
  userType: null,
  jobs: [],
  messages: [],
  isAuthenticated: false,
  sessionReady: false,
  login: async () => {},
  logout: async () => {},
  createJob: async () => {},
  acceptJob: async () => {},
  updateJobStatus: async () => {},
  submitRating: async () => {},
  sendMessage: async () => {},
  markMessageRead: async () => {},
  sidebarOpen: false,
  toggleSidebar: () => {},
  selectedJob: null,
  setSelectedJob: () => {},
  clearValidationStatus: async () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);
export const useAppContext = () => useContext(AppContext);

const mapStatusFromDb = (status: string): Job['status'] => {
  if (status === 'en_route') return 'en-route';
  if (status === 'in_progress') return 'in-progress';
  return status as Job['status'];
};

const mapStatusToDb = (status: Job['status']) => {
  if (status === 'en-route') return 'en_route';
  if (status === 'in-progress') return 'in_progress';
  return status;
};

const mapJob = (row: any): Job => ({
  id: row.id,
  clientId: row.customer_id,
  providerId: row.provider_id ?? undefined,
  title: row.title,
  description: row.description ?? '',
  serviceType: row.services?.service_type === 'restocking'
    ? 'restocking'
    : row.services?.service_type === 'repair' || row.services?.service_type === 'maintenance'
      ? 'repair'
      : 'cleaning',
  address: row.address,
  scheduledDate: row.scheduled_at ? new Date(row.scheduled_at) : new Date(row.created_at),
  status: mapStatusFromDb(row.status),
  price: Number(row.quoted_amount ?? 0),
  platformFee: Number(row.platform_fee ?? 0),
  providerAmount: Number(row.provider_amount ?? 0),
  photos: row.completion_photos ?? [],
  createdAt: new Date(row.created_at),
  services: row.services?.slug ? [{ serviceId: row.services.slug }] : undefined,
  category: row.services?.category ?? undefined,
});

const mapMessage = (row: any): Message => ({
  id: row.id,
  jobId: row.job_id ?? '',
  senderId: row.sender_id,
  recipientId: row.recipient_id,
  content: row.body,
  timestamp: new Date(row.created_at),
  readAt: row.read_at ? new Date(row.read_at) : undefined,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'client' | 'provider' | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const loadJobsAndMessages = async (userId: string) => {
    const { data: jobRows, error: jobsError } = await supabase
      .from('jobs')
      .select('*, services(id,slug,name,category,service_type,unit)')
      .order('created_at', { ascending: false });
    if (jobsError) throw jobsError;

    const { data: messageRows, error: messagesError } = await supabase
      .from('messages')
      .select('id,job_id,sender_id,recipient_id,body,read_at,created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (messagesError) throw messagesError;

    const jobIds = (jobRows ?? []).map((row: any) => row.id);
    const { data: reviewRows, error: reviewsError } = jobIds.length
      ? await supabase.from('reviews').select('job_id,rating,review').in('job_id', jobIds)
      : { data: [], error: null };
    if (reviewsError) throw reviewsError;

    const reviewByJob = new Map((reviewRows ?? []).map((row: any) => [row.job_id, row]));
    setJobs((jobRows ?? []).map((row: any) => ({
      ...mapJob(row),
      rating: reviewByJob.get(row.id)?.rating,
      review: reviewByJob.get(row.id)?.review ?? undefined
    })));
    setMessages([...(messageRows ?? [])].reverse().map(mapMessage));
  };

  const refreshData = async (userId: string) => {
    const [{ data: authData, error: authError }, { data: profile, error: profileError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('profiles').select('id, full_name, phone, role, avatar_url').eq('id', userId).maybeSingle(),
    ]);
    if (authError) throw authError;
    if (profileError) throw profileError;
    if (!profile) throw new Error('Your account profile could not be loaded.');

    const authUser = authData.user;
    const requestedRole = authUser?.user_metadata?.requested_role;
    let provider: any = null;

    if (profile.role === 'provider' || requestedRole === 'provider') {
      const { data: existingProvider, error: providerError } = await supabase
        .from('providers')
        .select('id,status,bio,service_area,rating,completed_jobs')
        .eq('id', userId)
        .maybeSingle();
      if (providerError) throw providerError;
      provider = existingProvider;

      if (!provider && requestedRole === 'provider') {
        const { data: createdProvider, error: createProviderError } = await supabase
          .from('providers')
          .insert({ id: userId, status: 'pending' })
          .select('id,status,bio,service_area,rating,completed_jobs')
          .single();
        if (createProviderError) throw createProviderError;
        provider = createdProvider;
      }
    }

    const isProviderAccount = profile.role === 'provider' || Boolean(provider);
    const mappedUser: User = {
      id: profile.id,
      name: profile.full_name || authUser?.email?.split('@')[0] || 'User',
      email: authUser?.email || '',
      type: isProviderAccount ? 'provider' : 'client',
      phone: profile.phone ?? '',
      username: authUser?.email?.split('@')[0] ?? '',
      isValidated: !isProviderAccount || provider?.status === 'approved',
      validationStatus: isProviderAccount
        ? (provider?.status === 'approved' ? 'approved' : provider?.status === 'rejected' ? 'rejected' : 'pending')
        : 'approved',
      isAdmin: profile.role === 'admin',
      rating: provider?.rating ? Number(provider.rating) : undefined,
    };

    setCurrentUser(mappedUser);
    setUserType(mappedUser.type);
    await loadJobsAndMessages(userId);
  };

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) await refreshData(session.user.id);
      } catch (error) {
        console.error('Session initialization failed:', error);
      } finally {
        if (mounted) setSessionReady(true);
      }
    };
    void initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setUserType(null);
        setJobs([]);
        setMessages([]);
        setSelectedJob(null);
        setSessionReady(true);
        return;
      }

      window.setTimeout(() => {
        void refreshData(session.user.id).catch((error) => console.error('Failed to refresh authenticated session:', error));
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    const userId = currentUser.id;

    const syncJobs = () => {
      if (!mounted) return;
      void loadJobsAndMessages(userId).catch((error) => {
        console.error('Realtime job sync failed:', error);
      });
    };

    const syncProfile = () => {
      if (!mounted) return;
      void refreshData(userId).catch((error) => {
        console.error('Realtime profile sync failed:', error);
      });
    };

    const channel = supabase
      .channel(`fixfresh-user-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, syncJobs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (!mounted) return;

        if (payload.eventType === 'INSERT') {
          const incoming = mapMessage(payload.new);
          setMessages((previous) =>
            previous.some((message) => message.id === incoming.id)
              ? previous
              : [...previous, incoming]
          );
        } else if (payload.eventType === 'UPDATE') {
          const incoming = mapMessage(payload.new);
          setMessages((previous) =>
            previous.map((message) => message.id === incoming.id ? { ...message, ...incoming } : message)
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages((previous) => previous.filter((message) => message.id !== payload.old.id));
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, syncProfile)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'providers',
        filter: `id=eq.${userId}`
      }, syncProfile)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Fix & Fresh realtime channel error');
        }
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const login = async (user: User) => {
    try {
      await refreshData(user.id);
    } catch (error: any) {
      toast({ title: 'Login Error', description: error?.message ?? 'Unable to load your account.', variant: 'destructive' });
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Logout Error', description: error.message, variant: 'destructive' });
      return;
    }
    setCurrentUser(null);
    setUserType(null);
    setJobs([]);
    setMessages([]);
    setSelectedJob(null);
    toast({ title: 'Goodbye!', description: 'You have been logged out.' });
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => {
    if (!currentUser || currentUser.type !== 'client') return;

    let serviceId: string | null = null;
    const serviceSlug = jobData.services?.[0]?.serviceId;

    if (serviceSlug) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('slug', serviceSlug)
        .single();
      if (serviceError) {
        toast({ title: 'Booking Error', description: serviceError.message, variant: 'destructive' });
        throw serviceError;
      }
      serviceId = service.id;
    }

    const { error } = await supabase.from('jobs').insert({
      customer_id: currentUser.id,
      service_id: serviceId,
      status: 'requested',
      title: jobData.title,
      description: jobData.description,
      address: jobData.address,
      scheduled_at: jobData.scheduledDate?.toISOString() ?? null,
      quoted_amount: Math.max(0, Number(jobData.price || 0)),
    });

    if (error) {
      toast({ title: 'Booking Error', description: error.message, variant: 'destructive' });
      throw error;
    }

    await refreshData(currentUser.id);
    toast({
      title: 'Service request submitted',
      description: 'Your request is now awaiting provider matching. No payment was processed yet.'
    });
  };

  const acceptJob = async (jobId: string, providerId: string) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ provider_id: providerId, status: 'scheduled' })
      .eq('id', jobId)
      .is('provider_id', null)
      .select('id')
      .maybeSingle();

    if (error) {
      toast({ title: 'Accept Job Error', description: error.message, variant: 'destructive' });
      return;
    }

    if (!data) {
      toast({ title: 'Job Unavailable', description: 'Another provider may have already accepted this request.', variant: 'destructive' });
      return;
    }

    await refreshData(providerId);
    toast({ title: 'Job Accepted!', description: 'The job is now scheduled for you.' });
  };

  const updateJobStatus = async (jobId: string, status: Job['status'], photos?: string[]) => {
    const payload: Record<string, unknown> = { status: mapStatusToDb(status) };
    if (photos) payload.completion_photos = photos;

    const { error } = await supabase.from('jobs').update(payload).eq('id', jobId);
    if (error) {
      toast({ title: 'Status Update Error', description: error.message, variant: 'destructive' });
      return;
    }

    if (currentUser) await refreshData(currentUser.id);
    toast({ title: 'Status Updated!', description: 'Job status changed to ' + status.replace('-', ' ') + '.' });
  };

  const submitRating = async (jobId: string, rating: number, review: string) => {
    const job = jobs.find(item => item.id === jobId);
    if (!job?.providerId || !currentUser || currentUser.type !== 'client') return;

    const { error } = await supabase.from('reviews').insert({
      job_id: jobId,
      customer_id: currentUser.id,
      provider_id: job.providerId,
      rating,
      review
    });

    if (error) {
      toast({ title: 'Review Error', description: error.message, variant: 'destructive' });
      return;
    }

    await refreshData(currentUser.id);
    toast({ title: 'Rating Submitted!', description: 'Thank you for your feedback.' });
  };

  const sendMessage = useCallback(async (jobId: string, recipientId: string, body: string) => {
    if (!currentUser) return;

    const trimmed = body.trim();
    if (!trimmed) return;

    if (trimmed.length > 2000) {
      toast({
        title: 'Message too long',
        description: 'Messages are limited to 2,000 characters.',
        variant: 'destructive'
      });
      return;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: currentUser.id,
        recipient_id: recipientId,
        body: trimmed
      })
      .select('id,job_id,sender_id,recipient_id,body,read_at,created_at')
      .single();

    if (error) {
      toast({ title: 'Message failed', description: error.message, variant: 'destructive' });
      return;
    }

    const outgoing = mapMessage(data);
    setMessages((previous) =>
      previous.some((message) => message.id === outgoing.id)
        ? previous
        : [...previous, outgoing]
    );
  }, [currentUser]);

  const markMessageRead = useCallback(async (messageId: string) => {
    if (!currentUser) return;

    const readAt = new Date();
    setMessages((previous) =>
      previous.map((message) =>
        message.id === messageId
          ? { ...message, readAt }
          : message
      )
    );

    const { error } = await supabase
      .from('messages')
      .update({ read_at: readAt.toISOString() })
      .eq('id', messageId)
      .eq('recipient_id', currentUser.id)
      .is('read_at', null);

    if (error) {
      toast({ title: 'Message update failed', description: error.message, variant: 'destructive' });
    }
  }, [currentUser]);

  const clearValidationStatus = async () => {
    if (!currentUser) return;
    const wasValidated = currentUser.isValidated;
    await refreshData(currentUser.id);
    toast({
      title: 'Verification status refreshed',
      description: wasValidated
        ? 'Your provider verification is approved.'
        : 'Your provider application is still awaiting admin approval.'
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userType,
      jobs,
      messages,
      isAuthenticated: !!currentUser,
      sessionReady,
      login,
      logout,
      createJob,
      acceptJob,
      updateJobStatus,
      submitRating,
      sendMessage,
      markMessageRead,
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen(prev => !prev),
      selectedJob,
      setSelectedJob,
      clearValidationStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};