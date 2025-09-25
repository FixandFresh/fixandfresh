import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3, DollarSign, Users, Package, ArrowLeft, Mail, Briefcase, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { PriceManager } from './admin/PriceManager';
import { OffersManager } from './admin/OffersManager';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import UsersManager from './admin/UsersManager';
import JobsManager from './admin/JobsManager';
import EmailSystem from './admin/EmailSystem';
import Logo from './Logo';
import ValidationManager from './admin/ValidationManager';

interface AdminDashboardProps {
  onExitAdmin?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  const translations = {
    en: {
      title: 'Admin Dashboard',
      analytics: 'Analytics',
      pricing: 'Pricing',
      offers: 'Offers',
      users: 'Users',
      jobs: 'Jobs',
      email: 'Email',
      validations: 'Validations',
      settings: 'Settings',
      overview: 'Overview',
      totalRevenue: 'Total Revenue',
      activeUsers: 'Active Users',
      completedJobs: 'Completed Jobs',
      pendingJobs: 'Pending Jobs',
      exitAdmin: 'Exit Admin'
    },

    es: {
      title: 'Panel de Administración',
      analytics: 'Análisis',
      pricing: 'Precios',
      offers: 'Ofertas',
      users: 'Usuarios',
      jobs: 'Trabajos',
      email: 'Email',
      settings: 'Configuración',
      overview: 'Resumen',
      totalRevenue: 'Ingresos Totales',
      activeUsers: 'Usuarios Activos',
      completedJobs: 'Trabajos Completados',
      pendingJobs: 'Trabajos Pendientes',
      exitAdmin: 'Salir de Admin'
    },
    fr: {
      title: 'Tableau de Bord Admin',
      analytics: 'Analyses',
      pricing: 'Tarification',
      offers: 'Offres',
      users: 'Utilisateurs',
      jobs: 'Emplois',
      email: 'Email',
      settings: 'Paramètres',
      overview: 'Aperçu',
      totalRevenue: 'Revenus Totaux',
      activeUsers: 'Utilisateurs Actifs',
      completedJobs: 'Travaux Terminés',
      pendingJobs: 'Travaux en Attente',
      exitAdmin: 'Quitter Admin'
    },
    pt: {
      title: 'Painel Administrativo',
      analytics: 'Análises',
      pricing: 'Preços',
      offers: 'Ofertas',
      users: 'Usuários',
      jobs: 'Trabalhos',
      email: 'Email',
      settings: 'Configurações',
      overview: 'Visão Geral',
      totalRevenue: 'Receita Total',
      activeUsers: 'Usuários Ativos',
      completedJobs: 'Trabalhos Concluídos',
      pendingJobs: 'Trabalhos Pendentes',
      exitAdmin: 'Sair do Admin'
    }
  };

  const t = translations[language];

  const handleExitAdmin = () => {
    if (onExitAdmin) {
      onExitAdmin();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo className="flex-shrink-0" />
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExitAdmin}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.exitAdmin}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t.title}</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-1">
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-1" />
              {t.analytics}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-1" />
              {t.users}
            </TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Briefcase className="h-4 w-4 mr-1" />
              {t.jobs}
            </TabsTrigger>
            <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Mail className="h-4 w-4 mr-1" />
              {t.email}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-1" />
              {t.pricing}
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-1" />
              {t.offers}
            </TabsTrigger>
            <TabsTrigger value="validations" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <FileCheck className="h-4 w-4 mr-1" />
              {t.validations}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-1" />
              {t.settings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManager />
          </TabsContent>

          <TabsContent value="email">
            <EmailSystem />
          </TabsContent>

          <TabsContent value="pricing">
            <PriceManager />
          </TabsContent>

          <TabsContent value="offers">
            <OffersManager />
          </TabsContent>

          <TabsContent value="validations">
            <ValidationManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="app-name" className="text-sm font-semibold text-slate-700">App Name</Label>
                    <Input id="app-name" defaultValue="Fix & Fresh" className="rounded-xl border-emerald-200 focus:border-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-sm font-semibold text-slate-700">Support Email</Label>
                    <Input id="support-email" defaultValue="support@fixandfresh.com" className="rounded-xl border-emerald-200 focus:border-emerald-400" />
                  </div>
                  <Button className="w-full sm:w-auto">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;