import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Menu, MapPin, Calendar, DollarSign, Upload, Star } from 'lucide-react';
import { Job, User } from '@/types';

// SearchBar Component
export const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  onServiceSelect: (service: any) => void;
  placeholder: string;
}> = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>
    </form>
  );
};

// MobileMenu Component
export const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}> = ({ isOpen, onClose, onNavigate }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('app.title')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <nav className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start mb-2"
            onClick={() => { onNavigate('dashboard'); onClose(); }}
          >
            {t('dashboard.title')}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start mb-2"
            onClick={() => { onNavigate('create-job'); onClose(); }}
          >
            {t('dashboard.createJob')}
          </Button>
        </nav>
      </div>
    </div>
  );
};

// JobForm Component
export const JobForm: React.FC<{
  onSubmit: (job: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: 0,
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob = {
      ...formData,
      serviceType: 'cleaning' as const,
      status: 'scheduled' as const,
      scheduledDate: new Date(formData.scheduledDate)
    };
    onSubmit(newJob);
    
    // Simulate payment processing for demo
    setTimeout(() => {
      const commission = formData.price * 0.2;
      const providerEarnings = formData.price * 0.8;
      alert(`Payment processed! Total: $${formData.price}\nProvider earns: $${providerEarnings.toFixed(2)}\nPlatform commission: $${commission.toFixed(2)}`);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.createJob')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('job.description')}</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('job.location')}</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('job.price')}</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('job.date')}</label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">{t('form.submit')}</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                {t('form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// JobDetail Component
export const JobDetail: React.FC<{
  job: Job;
  user: User;
  onBack: () => void;
  onUpdateStatus: (jobId: string, status: Job['status']) => void;
  onSubmitRating: (jobId: string, rating: number, review: string) => void;
}> = ({ job, user, onBack, onUpdateStatus }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <p className="text-gray-600 mt-2">{job.description}</p>
            </div>
            <Badge className={getStatusColor(job.status)}>
              {t(`job.status.${job.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {job.address}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                {job.scheduledDate.toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-5 h-5 mr-2" />
                ${job.price}
              </div>
            </div>
            
            {user.type === 'provider' && job.providerId === user.id && (
              <div className="space-y-2">
                {job.status === 'scheduled' && (
                  <Button 
                    onClick={() => onUpdateStatus(job.id, 'en-route')}
                    className="w-full"
                  >
                    Start Journey
                  </Button>
                )}
                {job.status === 'en-route' && (
                  <Button 
                    onClick={() => onUpdateStatus(job.id, 'in-progress')}
                    className="w-full"
                  >
                    Start Work
                  </Button>
                )}
                {job.status === 'in-progress' && (
                  <Button 
                    onClick={() => onUpdateStatus(job.id, 'completed')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {t('job.complete')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ServicesList Component
export const ServicesList: React.FC = () => {
  const { t } = useLanguage();
  const services = [
    { id: 'cleaning', name: t('services.cleaning'), icon: '🧹' },
    { id: 'plumbing', name: t('services.plumbing'), icon: '🔧' },
    { id: 'electrical', name: t('services.electrical'), icon: '⚡' },
    { id: 'painting', name: t('services.painting'), icon: '🎨' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">{service.icon}</div>
            <h3 className="font-medium">{service.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ProviderValidation Component
export const ProviderValidation: React.FC<{
  onValidationComplete: () => void;
  providerType: 'individual' | 'company';
  providerName: string;
  providerEmail: string;
}> = ({ onValidationComplete }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Provider Validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please upload your documents for validation.
          </p>
          <Button className="w-full" onClick={onValidationComplete}>
            <Upload className="w-4 h-4 mr-2" />
            Continue (Demo)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};