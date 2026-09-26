import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Users, Briefcase, FileCheck, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import UsersManager from './admin/UsersManager';
import JobsManager from './admin/JobsManager';
import PriceManager from './admin/PriceManager';
import ValidationManager from './admin/ValidationManager';
import Logo from './Logo';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab,setActiveTab]=useState('analytics');
  const labels={en:{analytics:'Analytics',users:'Users',jobs:'Jobs',pricing:'Pricing',validations:'Provider Verification',settings:'Settings',title:'Admin Dashboard'},es:{analytics:'Análisis',users:'Usuarios',jobs:'Trabajos',pricing:'Precios',validations:'Verificación de Proveedores',settings:'Configuración',title:'Panel de Administración'},fr:{analytics:'Analyses',users:'Utilisateurs',jobs:'Travaux',pricing:'Tarification',validations:'Vérification des fournisseurs',settings:'Paramètres',title:'Tableau de Bord Admin'},pt:{analytics:'Análises',users:'Usuários',jobs:'Trabalhos',pricing:'Preços',validations:'Verificação',settings:'Configurações',title:'Painel Administrativo'}};
  const t=labels[language];
  return <div className='min-h-screen bg-slate-50'><header className='bg-white border-b sticky top-0 z-50'><div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'><Logo/><div className='text-sm font-medium text-slate-500'>{t.title}</div></div></header><main className='max-w-7xl mx-auto p-6'><Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'><TabsList className='grid w-full grid-cols-6 bg-white border'><TabsTrigger value='analytics'><BarChart3 className='h-4 w-4 mr-1'/>{t.analytics}</TabsTrigger><TabsTrigger value='users'><Users className='h-4 w-4 mr-1'/>{t.users}</TabsTrigger><TabsTrigger value='jobs'><Briefcase className='h-4 w-4 mr-1'/>{t.jobs}</TabsTrigger><TabsTrigger value='pricing'><DollarSign className='h-4 w-4 mr-1'/>{t.pricing}</TabsTrigger><TabsTrigger value='validations'><FileCheck className='h-4 w-4 mr-1'/>{t.validations}</TabsTrigger><TabsTrigger value='settings'><Settings className='h-4 w-4 mr-1'/>{t.settings}</TabsTrigger></TabsList><TabsContent value='analytics'><AnalyticsDashboard/></TabsContent><TabsContent value='users'><UsersManager/></TabsContent><TabsContent value='jobs'><JobsManager/></TabsContent><TabsContent value='pricing'><PriceManager/></TabsContent><TabsContent value='validations'><ValidationManager/></TabsContent><TabsContent value='settings'><Card><CardHeader><CardTitle>{t.settings}</CardTitle></CardHeader><CardContent><p className='text-slate-600'>Production configuration is managed from the secured backend. Payment and email integrations will be added only when their providers are connected.</p></CardContent></Card></TabsContent></Tabs></main></div>;
};

export default AdminDashboard;