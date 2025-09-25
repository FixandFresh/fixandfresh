import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, DollarSign, CheckCircle, BookOpen, Award } from 'lucide-react';
import { User, Job } from '@/types';
import { ServicesList } from './ServicesList';
import { TrainingModule } from './TrainingModule';
import { trainingModules } from '@/data/trainingManual';
import { useToast } from '@/hooks/use-toast';

interface ProviderDashboardProps {
  user: User;
  availableJobs: Job[];
  myJobs: Job[];
  onAcceptJob: (job: Job) => void;
  onViewJob: (job: Job) => void;
  searchQuery: string;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  user,
  availableJobs,
  myJobs,
  onAcceptJob,
  onViewJob,
  searchQuery
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  // Ensure user is defined before proceeding
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  const handleAcceptJob = (job: Job) => {
    if (!user.isValidated) {
      toast({
        title: 'Account Not Validated',
        description: 'Please complete account validation to accept jobs',
        variant: 'destructive'
      });
      return;
    }
    onAcceptJob(job);
  };

  const totalEarnings = (myJobs || [])
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + (job.price * 0.8), 0);

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const trainingProgress = (completedModules.size / trainingModules.length) * 100;

  const filteredAvailableJobs = availableJobs.filter(job => {
    if (searchQuery) {
      return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.address.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const sortedJobs = [...filteredAvailableJobs].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price;
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name || 'Provider'}!</p>
        {!user.isValidated && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Your account is pending validation. You can browse jobs but cannot accept them until validated.</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">{t('dashboard.jobs')}</TabsTrigger>
          <TabsTrigger value="services">{t('services.title')}</TabsTrigger>
          <TabsTrigger value="training">
            <BookOpen className="w-4 h-4 mr-2" />
            {t('training.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.availableJobs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{availableJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.myJobs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{(myJobs || []).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.completedJobs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(myJobs || []).filter(job => job.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.totalEarnings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mb-6">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Posted</SelectItem>
                <SelectItem value="price">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('dashboard.availableJobs')} ({availableJobs.length})</h2>
            <div className="space-y-4">
              {sortedJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    {availableJobs.length === 0 ? 'No jobs available at the moment' : 'No jobs match your search'}
                  </CardContent>
                </Card>
              ) : (
                sortedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <p className="text-gray-600 mt-1">{job.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Service: {job.serviceType}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Available
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {job.scheduledDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${job.price}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAcceptJob(job)}
                          disabled={!user.isValidated}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Job
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => onViewJob(job)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {myJobs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Jobs ({myJobs.length})</h2>
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <p className="text-gray-600 mt-1">{job.description}</p>
                        </div>
                        <Badge className={
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                          job.status === 'en-route' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {job.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {job.scheduledDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${job.price} (You earn: ${(job.price * 0.8).toFixed(2)})
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline"
                        onClick={() => onViewJob(job)}
                        className="w-full"
                      >
                        View Job Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{t('services.available')}</h2>
            <p className="text-gray-600">{t('services.description')}</p>
          </div>
          <ServicesList />
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{t('training.title')}</h2>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {completedModules.size}/{trainingModules.length} modules completed
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            {trainingModules.map((module) => (
              <TrainingModule
                key={module.id}
                module={module}
                onComplete={handleModuleComplete}
                isCompleted={completedModules.has(module.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;