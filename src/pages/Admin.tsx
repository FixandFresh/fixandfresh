import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import AdminDashboard from '@/components/AdminDashboard';

const AdminGate: React.FC = () => {
  const [state, setState] = useState<'loading'|'authorized'|'denied'>('loading');
  const navigate = useNavigate();
  const { currentUser, sessionReady } = useAppContext();

  useEffect(() => {
    if (sessionReady && !currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, sessionReady, navigate]);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) navigate('/', { replace: true });
        return;
      }
      const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!mounted) return;
      if (error || profile?.role !== 'admin') {
        setState('denied');
        return;
      }
      setState('authorized');
    };
    void check();
    return () => { mounted = false; };
  }, [navigate]);

  if (state === 'loading') return <div className='min-h-screen flex items-center justify-center'>Checking admin access…</div>;
  if (state === 'denied') return <div className='min-h-screen flex items-center justify-center p-6'><div className='max-w-md text-center'><h1 className='text-2xl font-bold mb-2'>Access denied</h1><p className='text-slate-600 mb-6'>This area is restricted to Fix & Fresh administrators.</p><button className='underline' onClick={() => navigate('/')}>Return to Fix & Fresh</button></div></div>;
  return <AdminDashboard />;
};

const Admin: React.FC = () => <AppProvider><AdminGate/></AppProvider>;

export default Admin;
