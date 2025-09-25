import React from 'react';
import AppLayout from '@/components/AppLayout';
import AuthForm from '@/components/AuthForm';
import { AppProvider, useAppContext } from '@/contexts/AppContext';

const IndexContent: React.FC = () => {
  const { currentUser, login } = useAppContext();
  
  if (!currentUser) {
    return <AuthForm onAuthSuccess={login} />;
  }
  
  return <AppLayout />;
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <IndexContent />
    </AppProvider>
  );
};

export default Index;
