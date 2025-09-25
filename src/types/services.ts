export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'residential' | 'commercial' | 'specialty' | 'maintenance' | 'bundle';
  type: 'cleaning' | 'restocking' | 'repair' | 'maintenance';
  duration?: string;
  frequency?: 'one-time' | 'weekly' | 'monthly';
  unit?: 'job' | 'hour' | 'room' | 'load' | 'sqft';
  marketPrice?: number;
  isAddOn?: boolean;
  bundleServices?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: Service[];
}

export interface ServiceSelection {
  serviceId: string;
  quantity?: number;
  rooms?: number;
  sqft?: number;
  addOns?: string[];
}