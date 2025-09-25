import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react';
import { Job, User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobDetailProps {
  job: Job;
  user: User;
  onBack: () => void;
  onUpdateStatus: (jobId: string, status: Job['status']) => void;
  onSubmitRating: (jobId: string, rating: number) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, user, onBack, onUpdateStatus, onSubmitRating }) => {
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

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'scheduled': return t('job.status.scheduled');
      case 'en-route': return t('job.status.enRoute');
      case 'in-progress': return t('job.status.inProgress');
      case 'completed': return t('job.status.completed');
      case 'cancelled': return t('job.status.cancelled');
      default: return status;
    }
  };

  const canUpdateStatus = user.type === 'provider' && job.providerId === user.id;
  const canRate = user.type === 'client' && job.status === 'completed' && !job.rating;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(job.status)}>
                  {getStatusText(job.status)}
                </Badge>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.address}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.scheduledDate.toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">${job.price}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t('job.description')}</h3>
              <p className="text-gray-600">{job.description}</p>
            </div>

            {canUpdateStatus && (
              <div>
                <h3 className="font-semibold mb-2">{t('job.updateStatus')}</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(job.id, 'en-route')}
                    disabled={job.status !== 'scheduled'}
                  >
                    {t('job.status.enRoute')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(job.id, 'in-progress')}
                    disabled={job.status !== 'en-route'}
                  >
                    {t('job.startJob')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(job.id, 'completed')}
                    disabled={job.status !== 'in-progress'}
                  >
                    {t('job.complete')}
                  </Button>
                </div>
              </div>
            )}

            {canRate && (
              <div>
                <h3 className="font-semibold mb-2">{t('job.rateService')}</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      size="sm"
                      variant="outline"
                      onClick={() => onSubmitRating(job.id, rating)}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {job.rating && (
              <div>
                <h3 className="font-semibold mb-2">{t('job.rating')}</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-2 text-lg font-medium">{job.rating}/5</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetail;