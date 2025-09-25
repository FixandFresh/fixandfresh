import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Job, Message, AppState } from '@/types';
import { ServiceSelection } from '@/types/services';
import { services } from '@/data/services';
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
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Initialize immediately without any async operations
    console.log('AppContext initializing...');
    
    // Set a temporary user to bypass login
    const tempUser: User = {
      id: 'temp-user-123',
      name: 'Test User',
      email: 'test@example.com',
      type: 'client',
      phone: '+1234567890',
      username: 'testuser',
      isValidated: true,
      validationStatus: 'approved'
    };
    
    console.log('Setting temp user:', tempUser);
    setCurrentUser(tempUser);
    setUserType('client');
    setSessionChecked(true);
    
    // Sample jobs
    const sampleJobs: Job[] = [
      {
        id: '1',
        clientId: 'temp-user-123',
        title: 'Standard Airbnb Turnover',
        description: 'Dust, mop, disinfect, trash removal for 2-bedroom apartment',
        serviceType: 'cleaning',
        address: '123 Casco Viejo, Panama City, Panama',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'scheduled',
        price: 32,
        category: 'residential',
        services: [{ serviceId: 'standard-airbnb' }],
        createdAt: new Date(),
      }
    ];
    setJobs(sampleJobs);
    console.log('AppContext initialized successfully');
  }, []);

  const login = async (user: User) => {
    try {
      console.log('Login called with user:', user);
      
      if (!user || !user.id) {
        console.error('Invalid user object provided to login');
        return;
      }
      
      const validatedUser: User = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        type: user.type || 'client',
        phone: user.phone || '',
        username: user.username || '',
        isValidated: user.isValidated !== undefined ? user.isValidated : (user.type === 'client'),
        validationStatus: user.validationStatus || (user.type === 'client' ? 'approved' : 'pending'),
        providerType: user.providerType || undefined
      };
      
      console.log('Setting current user:', validatedUser);
      setCurrentUser(validatedUser);
      setUserType(validatedUser.type);
      
      toast({
        title: 'Welcome to Fix & Fresh!',
        description: `Logged in as ${validatedUser.type}`,
      });
    } catch (error) {
      console.error('Error in login function:', error);
      toast({
        title: 'Login Error',
        description: 'There was an error logging you in. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const logout = async () => {
    try {
      // Skip Supabase signOut to avoid fetch errors
      setCurrentUser(null);
      setUserType(null);
      localStorage.removeItem('fixfresh_credentials');
      toast({
        title: 'Goodbye!',
        description: 'You have been logged out',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => {
    if (!currentUser) return;
    
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      clientId: currentUser.id,
      createdAt: new Date(),
    };
    
    setJobs(prev => [...prev, newJob]);
    toast({
      title: 'Service Booked!',
      description: 'Your service request has been posted. Payment required to confirm.',
    });
  };

  const processPayment = (jobId: string, amount: number) => {
    // Simulate payment processing
    const commission = amount * 0.2; // 20% platform fee
    const providerEarnings = amount * 0.8; // 80% to provider
    
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'scheduled' as Job['status'], paid: true } : job
    ));
    
    toast({
      title: 'Payment Successful!',
      description: `Paid $${amount}. Provider will earn $${providerEarnings.toFixed(2)}, platform fee $${commission.toFixed(2)}`,
    });
  };

  const acceptJob = (jobId: string, providerId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, providerId, status: 'scheduled' as Job['status'] }
        : job
    ));
    toast({
      title: 'Job Accepted!',
      description: 'You have accepted this job',
    });
  };

  const updateJobStatus = (jobId: string, status: Job['status'], photos?: string[]) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status, ...(photos && { photos }) } : job
    ));
    toast({
      title: 'Status Updated!',
      description: `Job status changed to ${status.replace('-', ' ')}`,
    });
  };

  const submitRating = (jobId: string, rating: number, review: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, rating, review } : job
    ));
    toast({
      title: 'Rating Submitted!',
      description: 'Thank you for your feedback',
    });
  };

  const clearValidationStatus = () => {
    if (currentUser && currentUser.type === 'provider') {
      const updatedUser = { ...currentUser, isValidated: true, validationStatus: 'approved' as const };
      setCurrentUser(updatedUser);
      toast({
        title: 'Validation Cleared!',
        description: 'You can now access the provider dashboard',
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

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