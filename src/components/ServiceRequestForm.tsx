import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, DollarSign } from 'lucide-react';
import { Service } from '@/types/services';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ServiceRequestFormProps {
  service: Service;
  onSubmit: (jobId: string) => void;
  onCancel: () => void;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  service,
  onSubmit,
  onCancel
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createJob, currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    scheduledDate: undefined as Date | undefined,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.scheduledDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a request',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const jobId = Math.random().toString(36).substr(2, 9);
      
      createJob({
        title: service.name,
        description: formData.description || service.description,
        address: formData.address,
        scheduledDate: formData.scheduledDate,
        price: service.price,
        status: 'pending',
        serviceType: service.category,
        category: 'residential',
        services: [{ serviceId: service.id }]
      });

      toast({
        title: 'Success',
        description: 'Service request submitted successfully!'
      });
      
      onSubmit(jobId);
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{service.icon}</span>
          Request {service.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-lg">${service.price}</div>
              <div className="text-sm text-gray-600">per {service.unit}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Service Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter the address where service is needed"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledDate ? format(formData.scheduledDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduledDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what you need help with..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions or requirements..."
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;