import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types';
import { Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobStatusUpdateProps {
  job: Job;
  onStatusUpdate: (jobId: string, newStatus: Job['status'], photos?: string[]) => void;
}

const JobStatusUpdate: React.FC<JobStatusUpdateProps> = ({ job, onStatusUpdate }) => {
  const { t } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<Job['status']>(job.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [photos, setPhotos] = useState<string[]>(job.photos || []);

  const statusOptions: { value: Job['status']; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'scheduled', label: t('job.status.scheduled'), icon: <Clock className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'en-route', label: t('job.status.enRoute'), icon: <MapPin className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in-progress', label: t('job.status.inProgress'), icon: <AlertCircle className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: t('job.status.completed'), icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  ];

  const getCurrentStatusInfo = () => {
    return statusOptions.find(option => option.value === job.status) || statusOptions[0];
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === job.status && photos.length === (job.photos?.length || 0)) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(job.id, selectedStatus, photos);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = getCurrentStatusInfo();
  const showPhotoUpload = selectedStatus === 'completed' || job.status === 'completed';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStatus.icon}
            {t('job.updateStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('validation.status')}:</span>
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('job.updateStatus')}:</label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Job['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleStatusUpdate}
            disabled={selectedStatus === job.status && photos.length === (job.photos?.length || 0) || isUpdating}
            className="w-full"
          >
            {isUpdating ? t('common.loading') : t('job.updateStatus')}
          </Button>
        </CardContent>
      </Card>
      
      {showPhotoUpload && (
        <PhotoUpload
          onPhotosChange={setPhotos}
          existingPhotos={job.photos}
          maxPhotos={5}
        />
      )}
    </div>
  );
};

export default JobStatusUpdate;