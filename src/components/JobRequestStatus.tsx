import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface JobRequest {
  id: string;
  service_id: string;
  title: string;
  description: string;
  address: string;
  scheduled_date: string;
  price: number;
  status: 'pending' | 'accepted' | 'scheduled' | 'en-route' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  provider_id?: string;
}

interface JobRequestStatusProps {
  jobId: string;
  onBack: () => void;
}

export const JobRequestStatus: React.FC<JobRequestStatusProps> = ({ jobId, onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [job, setJob] = useState<JobRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobStatus();
    
    // Subscribe to job updates
    const subscription = supabase
      .channel('job-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${jobId}`
      }, (payload) => {
        setJob(payload.new as JobRequest);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [jobId]);

  const fetchJobStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your request is waiting for a provider to accept it.';
      case 'accepted': return 'A provider has accepted your request and will contact you soon.';
      case 'scheduled': return 'Your service has been scheduled.';
      case 'en-route': return 'The provider is on their way to your location.';
      case 'in-progress': return 'Your service is currently in progress.';
      case 'completed': return 'Your service has been completed successfully!';
      case 'cancelled': return 'This request has been cancelled.';
      default: return 'Status unknown';
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Job not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Request Status</span>
          <Badge className={getStatusColor(job.status)}>
            {getStatusIcon(job.status)}
            <span className="ml-1 capitalize">{job.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">{getStatusMessage(job.status)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-gray-600 mt-1">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{job.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{new Date(job.scheduled_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm">${job.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Requested {new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back to Dashboard
          </Button>
          {job.status === 'pending' && (
            <Button variant="destructive" className="flex-1">
              Cancel Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobRequestStatus;