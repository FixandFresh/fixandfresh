import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface JobOffer {
  id: string;
  service_id: string;
  title: string;
  description: string;
  address: string;
  scheduled_date: string;
  price: number;
  status: string;
  created_at: string;
  client_id: string;
}

interface AvailableJobsProps {
  onJobAccepted: (jobId: string) => void;
}

export const AvailableJobs: React.FC<AvailableJobsProps> = ({ onJobAccepted }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableJobs();
    
    // Subscribe to new job offers
    const subscription = supabase
      .channel('job-offers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'jobs',
        filter: 'status=eq.pending'
      }, (payload) => {
        setJobs(prev => [payload.new as JobOffer, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs'
      }, (payload) => {
        const updatedJob = payload.new as JobOffer;
        setJobs(prev => prev.filter(job => job.id !== updatedJob.id));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to load available jobs';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingJob(jobId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('jobs')
        .update({
          provider_id: user.id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Ensure job is still pending

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Job accepted successfully!'
      });
      
      // Remove job from available list
      setJobs(prev => prev.filter(job => job.id !== jobId));
      onJobAccepted(jobId);
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept job. It may have been taken by another provider.',
        variant: 'destructive'
      });
    } finally {
      setAcceptingJob(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No available jobs at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Check back later for new opportunities!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Available Jobs ({jobs.length})</h2>
        <Button onClick={fetchAvailableJobs} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-gray-600 mt-1">{job.description}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 ml-4">
                New
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {job.address}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(job.scheduled_date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                ${job.price} (${(job.price * 0.8).toFixed(2)} after commission)
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {/* View details */}}
              >
                View Details
              </Button>
              <Button 
                onClick={() => handleAcceptJob(job.id)}
                disabled={acceptingJob === job.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {acceptingJob === job.id ? 'Accepting...' : 'Accept Job'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AvailableJobs;