import React, { useState } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleExitAdmin = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return <AdminDashboard onExitAdmin={handleExitAdmin} />;
};

export default Admin;