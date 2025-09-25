import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export const AnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState('7d');

  const translations = {
    en: {
      title: 'Analytics Dashboard',
      overview: 'Overview',
      revenue: 'Revenue',
      users: 'Users',
      totalRevenue: 'Total Revenue',
      activeUsers: 'Active Users',
      completedJobs: 'Completed Jobs',
      avgJobValue: 'Avg Job Value',
      revenueGrowth: 'Revenue Growth',
      userGrowth: 'User Growth',
      jobCompletion: 'Job Completion Rate',
      topServices: 'Top Services',
      recentActivity: 'Recent Activity',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      installation: 'Installation',
      last7days: 'Last 7 Days',
      last30days: 'Last 30 Days',
      last90days: 'Last 90 Days'
    },
    es: {
      title: 'Panel de Análisis',
      overview: 'Resumen',
      revenue: 'Ingresos',
      users: 'Usuarios',
      totalRevenue: 'Ingresos Totales',
      activeUsers: 'Usuarios Activos',
      completedJobs: 'Trabajos Completados',
      avgJobValue: 'Valor Promedio del Trabajo',
      revenueGrowth: 'Crecimiento de Ingresos',
      userGrowth: 'Crecimiento de Usuarios',
      jobCompletion: 'Tasa de Finalización de Trabajos',
      topServices: 'Servicios Principales',
      recentActivity: 'Actividad Reciente',
      cleaning: 'Limpieza',
      maintenance: 'Mantenimiento',
      installation: 'Instalación',
      last7days: 'Últimos 7 Días',
      last30days: 'Últimos 30 Días',
      last90days: 'Últimos 90 Días'
    },
    fr: {
      title: 'Tableau de Bord Analytique',
      overview: 'Aperçu',
      revenue: 'Revenus',
      users: 'Utilisateurs',
      totalRevenue: 'Revenus Totaux',
      activeUsers: 'Utilisateurs Actifs',
      completedJobs: 'Travaux Terminés',
      avgJobValue: 'Valeur Moyenne du Travail',
      revenueGrowth: 'Croissance des Revenus',
      userGrowth: 'Croissance des Utilisateurs',
      jobCompletion: 'Taux de Finalisation des Travaux',
      topServices: 'Services Principaux',
      recentActivity: 'Activité Récente',
      cleaning: 'Nettoyage',
      maintenance: 'Maintenance',
      installation: 'Installation',
      last7days: 'Derniers 7 Jours',
      last30days: 'Derniers 30 Jours',
      last90days: 'Derniers 90 Jours'
    },
    pt: {
      title: 'Painel de Análises',
      overview: 'Visão Geral',
      revenue: 'Receita',
      users: 'Usuários',
      totalRevenue: 'Receita Total',
      activeUsers: 'Usuários Ativos',
      completedJobs: 'Trabalhos Concluídos',
      avgJobValue: 'Valor Médio do Trabalho',
      revenueGrowth: 'Crescimento da Receita',
      userGrowth: 'Crescimento de Usuários',
      jobCompletion: 'Taxa de Conclusão de Trabalhos',
      topServices: 'Principais Serviços',
      recentActivity: 'Atividade Recente',
      cleaning: 'Limpeza',
      maintenance: 'Manutenção',
      installation: 'Instalação',
      last7days: 'Últimos 7 Dias',
      last30days: 'Últimos 30 Dias',
      last90days: 'Últimos 90 Dias'
    }
  };

  const t = translations[language];

  const metrics: MetricCard[] = [
    {
      title: t.totalRevenue,
      value: '$12,450',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: t.activeUsers,
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: t.completedJobs,
      value: '456',
      change: '+15.3%',
      trend: 'up',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: t.avgJobValue,
      value: '$27.30',
      change: '-2.1%',
      trend: 'down',
      icon: <TrendingUp className="h-4 w-4" />
    }
  ];

  const topServices = [
    { name: t.cleaning, revenue: '$8,450', percentage: 68 },
    { name: t.maintenance, revenue: '$2,340', percentage: 19 },
    { name: t.installation, revenue: '$1,660', percentage: 13 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          {t.title}
        </h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7d">{t.last7days}</TabsTrigger>
            <TabsTrigger value="30d">{t.last30days}</TabsTrigger>
            <TabsTrigger value="90d">{t.last90days}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                >
                  {metric.change}
                </Badge>
                <span>from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.topServices}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topServices.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">{service.revenue}</span>
                </div>
                <Progress value={service.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Job completed by Maria S.</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge variant="outline">+$32</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
                <Badge variant="secondary">User</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-muted-foreground">8 minutes ago</p>
                </div>
                <Badge variant="outline">+$45</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};