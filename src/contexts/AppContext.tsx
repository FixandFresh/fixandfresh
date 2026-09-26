import React, { createContext, useContext, useState } from 'react';
import { User, Job, Message, AppState } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => void;
  acceptJob: (jobId: string, providerId: string) => void;
  updateJobStatus: (jobId: string, status: Job['status'], photos?: string[]) => void;
  submitRating: (jobId: string, rating: number, review: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  clearValidationStatus: () => void;
}

const defaultAppContext: AppContextType = {
  currentUser: null,
  userType: null,
  jobs: [],
  messages: [],
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  createJob: () => {},
  acceptJob: () => {},
  updateJobStatus: () => {},
  submitRating: () => {},
  sidebarOpen: false,
  toggleSidebar: () => {},
  selectedJob: null,
  setSelectedJob: () => {},
  clearValidationStatus: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'client' | 'provider' | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const login = (user: User) => {
    if (!user?.id) {
      toast({
        title: 'Login Error',
        description: 'We could not verify your account.',
        variant: 'destructive',
      });
      return;
    }

    const validatedUser: User = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      type: user.type || 'client',
      phone: user.phone || '',
      username: user.username || '',
      isValidated: user.isValidated !== undefined ? user.isValidated : user.type === 'client',
      validationStatus: user.validationStatus || (user.type === 'client' ? 'approved' : 'pending'),
      providerType: user.providerType || undefined,
    };

    setCurrentUser(validatedUser);
    setUserType(validatedUser.type);

    toast({
      title: 'Welcome to Fix & Fresh!',
      description: `Logged in as ${validatedUser.type}`,
    });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase sign-out failed:', error);
      toast({
        title: 'Logout Error',
        description: 'We could not complete logout. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentUser(null);
    setUserType(null);
    setJobs([]);
    setMessages([]);
    setSelectedJob(null);

    toast({
      title: 'Goodbye!',
      description: 'You have been logged out.',
    });
  };

  const createJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => {
    if (!currentUser) return;

    const newJob: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      clientId: currentUser.id,
      createdAt: new Date(),
    };

    setJobs(prev => [...prev, newJob]);
    toast({
      title: 'Service Booked!',
      description: 'Your service request has been posted. Payment required to confirm.',
    });
  };

  const acceptJob = (jobId: string, providerId: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, providerId, status: 'scheduled' as Job['status'] } : job
    ));
    toast({ title: 'Job Accepted!', description: 'You have accepted this job.' });
  };

  const updateJobStatus = (jobId: string, status: Job['status'], photos?: string[]) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status, ...(photos && { photos }) } : job
    ));
    toast({
      title: 'Status Updated!',
      description: `Job status changed to ${status.replace('-', ' ')}.`,
    });
  };

  const submitRating = (jobId: string, rating: number, review: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, rating, review } : job
    ));
    toast({ title: 'Rating Submitted!', description: 'Thank you for your feedback.' });
  };

  const clearValidationStatus = () => {
    if (currentUser?.type === 'provider') {
      setCurrentUser({
        ...currentUser,
        isValidated: true,
        validationStatus: 'approved',
      });
      toast({
        title: 'Validation Cleared!',
        description: 'You can now access the provider dashboard.',
      });
    }
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userType,
        jobs,
        messages,
        isAuthenticated: !!currentUser,
        login,
        logout,
        createJob,
        acceptJob,
        updateJobStatus,
        submitRating,
        sidebarOpen,
        toggleSidebar,
        selectedJob,
        setSelectedJob,
        clearValidationStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};