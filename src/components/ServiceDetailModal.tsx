import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createJob, currentUser } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    propertySize: '',
    urgency: '',
    frequency: '',
    preferredDate: '',
    preferredTime: '',
    instructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a request',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDate = formData.preferredDate ? new Date(formData.preferredDate) : new Date();
      
      createJob({
        title: service.name,
        description: formData.instructions || service.description,
        address: formData.address,
        scheduledDate: scheduledDate,
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

      setFormData({
        fullName: '',
        email: '',
        address: '',
        propertySize: '',
        urgency: '',
        frequency: '',
        preferredDate: '',
        preferredTime: '',
        instructions: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service.name}
            <Badge variant={service.isAddOn ? "secondary" : "default"}>
              ${service.price}/{service.unit}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Service Description</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertySize">Property Size</Label>
                <Select value={formData.propertySize} onValueChange={(value) => setFormData({...formData, propertySize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (under 1000 sq ft)</SelectItem>
                    <SelectItem value="medium">Medium (1000-2000 sq ft)</SelectItem>
                    <SelectItem value="large">Large (over 2000 sq ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Within a week</SelectItem>
                    <SelectItem value="medium">Medium - Within 3 days</SelectItem>
                    <SelectItem value="high">High - Within 24 hours</SelectItem>
                    <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Any special requirements or instructions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailModal;
