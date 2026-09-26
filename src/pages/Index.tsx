import React from 'react';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import AuthForm from '@/components/AuthForm';
import { AppProvider, useAppContext } from '@/contexts/AppContext';

const IndexContent: React.FC = () => {
  const { currentUser, login, sessionReady } = useAppContext();

  if (!sessionReady) {
    return <div className='min-h-screen flex items-center justify-center bg-slate-50'><div className='text-center'><div className='text-2xl font-semibold text-slate-900'>Fix & Fresh</div><p className='text-sm text-slate-500 mt-2'>Loading your secure session…</p></div></div>;
  }

  if (!currentUser) return <AuthForm onAuthSuccess={login as any} />;
  if (currentUser.isAdmin) return <Navigate to='/admin' replace />;
  return <AppLayout />;
};

const Index: React.FC = () => <AppProvider><IndexContent /></AppProvider>;

export default Index;