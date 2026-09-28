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
import { SearchBar, JobDetail } from './SimpleComponents';
import ServicesList from './ServicesList';
import MobileMenu from './MobileMenu';
import type { Job } from '@/types';

type ViewType = 'dashboard' | 'create-job' | 'job-detail';

const AppLayout: React.FC = () => {
  const { currentUser, userType, jobs, logout, createJob, acceptJob, updateJobStatus, submitRating } = useAppContext();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser || !userType) return null;

  const handleCreateJob = () => setCurrentView('create-job');
  const handleJobSubmit = async (jobData: Omit<Job, 'id' | 'createdAt' | 'clientId'>) => { await createJob(jobData); setCurrentView('dashboard'); };
  const handleViewJob = (job: Job) => { setSelectedJob(job); setCurrentView('job-detail'); };
  const handleAcceptJob = async (job: Job) => { if (currentUser) await acceptJob(job.id, currentUser.id); };
  const handleBackToDashboard = () => { setCurrentView('dashboard'); setSelectedJob(null); };
  const handleSearch = (query: string) => setSearchQuery(query);
  const handleServiceSelect = () => { if (userType === 'client') setCurrentView('create-job'); };
  const handleMobileNavigation = (view: string) => { if (view === 'create-job') handleCreateJob(); else setCurrentView(view as ViewType); };
  const getAvailableJobs = () => jobs.filter(job => !job.providerId && ['requested', 'matching'].includes(job.status));
  const getMyJobs = () => userType === 'client' ? jobs.filter(job => job.clientId === currentUser.id) : jobs.filter(job => job.providerId === currentUser.id);

  const renderContent = () => {
    if (currentView === 'create-job') {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Choose a Service</h1>
          <p className='text-slate-600 mt-2'>Select a live service from our current catalog to start your request.</p>
        </div>
        <ServicesList />
      </div>
    );
  }
    if (currentView === 'job-detail' && selectedJob) return <JobDetail job={selectedJob} user={currentUser} onBack={handleBackToDashboard} onUpdateStatus={updateJobStatus} onSubmitRating={submitRating} />;
    return userType === 'client'
      ? <ClientDashboard user={currentUser} jobs={getMyJobs()} onCreateJob={handleCreateJob} onViewJob={handleViewJob} searchQuery={searchQuery} />
      : <ProviderDashboard user={currentUser} availableJobs={getAvailableJobs()} myJobs={getMyJobs()} onAcceptJob={handleAcceptJob} onViewJob={handleViewJob} searchQuery={searchQuery} />;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50'>
      <header className='bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm' onClick={() => setIsMobileMenuOpen(true)} className='md:hidden'><Menu className='w-5 h-5' /></Button>
              <Logo className='flex-shrink-0' />
              <span className='ml-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize'>{userType}</span>
            </div>
            <div className='hidden md:flex flex-1 max-w-md mx-8'><SearchBar onSearch={handleSearch} onServiceSelect={handleServiceSelect} placeholder={t('search.placeholder')} /></div>
            <div className='flex items-center space-x-2'>
              <div className='hidden md:flex items-center space-x-2'>
                <LanguageSelector />
                {currentUser.isAdmin && <Link to='/admin'><Button variant='ghost' size='sm'><Settings className='w-4 h-4 mr-1' /><span className='hidden lg:inline'>Admin</span></Button></Link>}
              </div>
              <span className='hidden sm:block text-sm text-slate-600 font-medium truncate'>{t('nav.hello')}, {currentUser.name}</span>
              <Button variant='ghost' size='sm' onClick={() => void logout()} className='hidden md:flex'><LogOut className='w-4 h-4 mr-1' /><span className='hidden lg:inline'>{t('nav.logout')}</span></Button>
            </div>
          </div>
          <div className='md:hidden pb-4'><SearchBar onSearch={handleSearch} onServiceSelect={handleServiceSelect} placeholder={t('search.placeholder')} /></div>
        </div>
      </header>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onNavigate={handleMobileNavigation} />
      <main className='flex-1'>{renderContent()}</main>
    </div>
  );
};

export default AppLayout;