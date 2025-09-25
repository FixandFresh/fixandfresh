import { ServiceSelection } from './services';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'provider';
  avatar?: string;
  rating?: number;
  phone?: string;
  username?: string;
  isValidated?: boolean;
  validationStatus?: 'pending' | 'approved' | 'rejected';
  providerType?: 'individual' | 'company';
}

export interface Job {
  id: string;
  clientId: string;
  providerId?: string;
  title: string;
  description: string;
  serviceType: 'cleaning' | 'restocking' | 'repair';
  address: string;
  scheduledDate: Date;
  status: 'scheduled' | 'en-route' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  photos?: string[];
  rating?: number;
  review?: string;
  createdAt: Date;
  services?: ServiceSelection[];
  category?: 'residential' | 'commercial' | 'specialty' | 'maintenance' | 'bundle';
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface AppState {
  currentUser: User | null;
  userType: 'client' | 'provider' | null;
  jobs: Job[];
  messages: Message[];
  isAuthenticated: boolean;
}