import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import ProviderDashboard from './ProviderDashboard';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';
import { SearchBar, JobForm, JobDetail } from './SimpleComponents';
import MobileMenu from './MobileMenu';

type ViewType = 'dashboard' | 'create-job' | 'job-detail';

const AppLayout: React.FC = () => {
  const { 
    currentUser, 
    userType, 
    jobs, 
    logout, 
    createJob, 
    acceptJob, 
    updateJobStatus, 
    submitRating 
  } = useAppContext();
  
  const { t } = useLanguage();
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // If user is not authenticated, don't render the layout
  if (!currentUser || !userType) {
    return null;
  }
  const handleCreateJob = () => {
    setCurrentView('create-job');
  };

  const handleJobSubmit = (jobData: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => {
    createJob(jobData);
    setCurrentView('dashboard');
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job-detail');
  };

  const handleAcceptJob = (job: Job) => {
    if (currentUser) {
      acceptJob(job.id, currentUser.id);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedJob(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleServiceSelect = (service: any) => {
    if (userType === 'client') {
      setCurrentView('create-job');
    }
  };

  const handleMobileNavigation = (view: string) => {
    if (view === 'create-job') {
      handleCreateJob();
    } else {
      setCurrentView(view as ViewType);
    }
  };

  const getAvailableJobs = () => {
    return jobs.filter(job => !job.providerId && job.status === 'scheduled');
  };

  const getMyJobs = () => {
    if (userType === 'client') {
      return jobs.filter(job => job.clientId === currentUser.id);
    } else {
      return jobs.filter(job => job.providerId === currentUser.id);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create-job':
        return (
          <JobForm 
            onSubmit={handleJobSubmit} 
            onCancel={handleBackToDashboard} 
          />
        );
      
      case 'job-detail':
        return selectedJob ? (
          <JobDetail 
            job={selectedJob} 
            user={currentUser}
            onBack={handleBackToDashboard}
            onUpdateStatus={updateJobStatus}
            onSubmitRating={submitRating}
          />
        ) : null;
      
      default:
        return userType === 'client' ? (
          <ClientDashboard 
            user={currentUser}
            jobs={getMyJobs()}
            onCreateJob={handleCreateJob}
            onViewJob={handleViewJob}
            searchQuery={searchQuery}
          />
        ) : (
          <ProviderDashboard 
            user={currentUser}
            availableJobs={getAvailableJobs()}
            myJobs={getMyJobs()}
            onAcceptJob={handleAcceptJob}
            onViewJob={handleViewJob}
            searchQuery={searchQuery}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <Logo className="flex-shrink-0" />
              
              <span className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize">
                {userType}
              </span>
            </div>
            
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar 
                onSearch={handleSearch}
                onServiceSelect={handleServiceSelect}
                placeholder={t('search.placeholder')}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                <LanguageSelector />
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    <span className="hidden lg:inline">Admin</span>
                  </Button>
                </Link>
              </div>
              <span className="hidden sm:block text-sm text-slate-600 font-medium truncate">
                {t('nav.hello')}, {currentUser.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex">
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">{t('nav.logout')}</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <SearchBar 
              onSearch={handleSearch}
              onServiceSelect={handleServiceSelect}
              placeholder={t('search.placeholder')}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleMobileNavigation}
      />

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default AppLayout;