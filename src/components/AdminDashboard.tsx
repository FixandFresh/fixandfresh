import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, DollarSign, Users, Briefcase, FileCheck, Settings, LogOut, Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import UsersManager from './admin/UsersManager';
import JobsManager from './admin/JobsManager';
import PriceManager from './admin/PriceManager';
import ValidationManager from './admin/ValidationManager';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('analytics');

  const labels = {
    en: {
      analytics: 'Analytics',
      users: 'Users',
      jobs: 'Jobs',
      pricing: 'Pricing',
      validations: 'Provider Verification',
      settings: 'Settings',
      title: 'Admin Dashboard',
      marketplace: 'Marketplace',
      logout: 'Log Out',
      signedInAs: 'Signed in as',
      adminAccount: 'Administrator account',
      settingsDescription: 'Manage your administrator session and review the production configuration status.',
      authStatus: 'Authentication',
      authStatusValue: 'Supabase authentication is active',
      backendStatus: 'Backend',
      backendStatusValue: 'Production database connected',
      payments: 'Payments',
      paymentsValue: 'Not connected yet',
      email: 'Email',
      emailValue: 'Authentication email is configured',
    },
    es: {
      analytics: 'Análisis',
      users: 'Usuarios',
      jobs: 'Trabajos',
      pricing: 'Precios',
      validations: 'Verificación de Proveedores',
      settings: 'Configuración',
      title: 'Panel de Administración',
      marketplace: 'Marketplace',
      logout: 'Cerrar sesión',
      signedInAs: 'Sesión iniciada como',
      adminAccount: 'cuenta administradora',
      settingsDescription: 'Administra tu sesión de administrador y revisa el estado de la configuración de producción.',
      authStatus: 'Autenticación',
      authStatusValue: 'La autenticación de Supabase está activa',
      backendStatus: 'Backend',
      backendStatusValue: 'Base de datos de producción conectada',
      payments: 'Pagos',
      paymentsValue: 'Todavía no conectado',
      email: 'Correo',
      emailValue: 'El correo de autenticación está configurado',
    },
    fr: {
      analytics: 'Analyses',
      users: 'Utilisateurs',
      jobs: 'Travaux',
      pricing: 'Tarification',
      validations: 'Vérification des fournisseurs',
      settings: 'Paramètres',
      title: 'Tableau de bord administrateur',
      marketplace: 'Marketplace',
      logout: 'Se déconnecter',
      signedInAs: 'Connecté en tant que',
      adminAccount: 'compte administrateur',
      settingsDescription: 'Gérez votre session administrateur et consultez l’état de la configuration de production.',
      authStatus: 'Authentification',
      authStatusValue: 'L’authentification Supabase est active',
      backendStatus: 'Backend',
      backendStatusValue: 'Base de données de production connectée',
      payments: 'Paiements',
      paymentsValue: 'Pas encore connecté',
      email: 'E-mail',
      emailValue: 'L’e-mail d’authentification est configuré',
    },
    pt: {
      analytics: 'Análises',
      users: 'Usuários',
      jobs: 'Trabalhos',
      pricing: 'Preços',
      validations: 'Verificação',
      settings: 'Configurações',
      title: 'Painel Administrativo',
      marketplace: 'Marketplace',
      logout: 'Sair',
      signedInAs: 'Conectado como',
      adminAccount: 'conta administradora',
      settingsDescription: 'Gerencie sua sessão de administrador e revise o status da configuração de produção.',
      authStatus: 'Autenticação',
      authStatusValue: 'A autenticação do Supabase está ativa',
      backendStatus: 'Backend',
      backendStatusValue: 'Banco de produção conectado',
      payments: 'Pagamentos',
      paymentsValue: 'Ainda não conectado',
      email: 'E-mail',
      emailValue: 'O e-mail de autenticação está configurado',
    },
  } as const;

  const t = labels[language];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='bg-white border-b sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-4'>
            <Logo />
            <div className='hidden sm:block text-sm font-medium text-slate-500'>{t.title}</div>
          </div>
          <div className='flex items-center gap-2'>
            <Link to='/'>
              <Button variant='outline' size='sm'>
                <Store className='h-4 w-4 mr-1' />
                {t.marketplace}
              </Button>
            </Link>
            <Button variant='destructive' size='sm' onClick={() => void handleLogout()}>
              <LogOut className='h-4 w-4 mr-1' />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto p-4 sm:p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-6 bg-white border h-auto'>
            <TabsTrigger value='analytics'><BarChart3 className='h-4 w-4 mr-1'/>{t.analytics}</TabsTrigger>
            <TabsTrigger value='users'><Users className='h-4 w-4 mr-1'/>{t.users}</TabsTrigger>
            <TabsTrigger value='jobs'><Briefcase className='h-4 w-4 mr-1'/>{t.jobs}</TabsTrigger>
            <TabsTrigger value='pricing'><DollarSign className='h-4 w-4 mr-1'/>{t.pricing}</TabsTrigger>
            <TabsTrigger value='validations'><FileCheck className='h-4 w-4 mr-1'/>{t.validations}</TabsTrigger>
            <TabsTrigger value='settings'><Settings className='h-4 w-4 mr-1'/>{t.settings}</TabsTrigger>
          </TabsList>

          <TabsContent value='analytics'><AnalyticsDashboard/></TabsContent>
          <TabsContent value='users'><UsersManager/></TabsContent>
          <TabsContent value='jobs'><JobsManager/></TabsContent>
          <TabsContent value='pricing'><PriceManager/></TabsContent>
          <TabsContent value='validations'><ValidationManager/></TabsContent>

          <TabsContent value='settings'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>{t.adminAccount}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  <div><span className='font-medium'>{t.signedInAs}:</span> {currentUser?.name || 'Administrator'}</div>
                  <div><span className='font-medium'>Email:</span> {currentUser?.email || '—'}</div>
                  <div><span className='font-medium'>Role:</span> admin</div>
                  <Button variant='destructive' className='mt-4' onClick={() => void handleLogout()}>
                    <LogOut className='h-4 w-4 mr-2' />
                    {t.logout}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.settings}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-sm text-slate-600'>
                  <p>{t.settingsDescription}</p>
                  <div className='grid grid-cols-1 gap-3'>
                    <div className='rounded-lg border bg-slate-50 p-3'>
                      <div className='font-medium text-slate-900'>{t.authStatus}</div>
                      <div className='mt-1'>{t.authStatusValue}</div>
                    </div>
                    <div className='rounded-lg border bg-slate-50 p-3'>
                      <div className='font-medium text-slate-900'>{t.backendStatus}</div>
                      <div className='mt-1'>{t.backendStatusValue}</div>
                    </div>
                    <div className='rounded-lg border bg-slate-50 p-3'>
                      <div className='font-medium text-slate-900'>{t.email}</div>
                      <div className='mt-1'>{t.emailValue}</div>
                    </div>
                    <div className='rounded-lg border bg-amber-50 border-amber-200 p-3'>
                      <div className='font-medium text-slate-900'>{t.payments}</div>
                      <div className='mt-1'>{t.paymentsValue}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
