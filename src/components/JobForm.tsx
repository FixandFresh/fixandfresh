import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobFormProps {
  onSubmit: (job: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => void;
  onCancel: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: 50,
    scheduledDate: new Date(),
    category: 'residential' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'scheduled',
      providerId: undefined
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t('job.bookService')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">{t('job.serviceTitle')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">{t('job.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">{t('job.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">{t('job.price')} ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {t('job.bookService')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobForm;