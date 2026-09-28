import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type TimeRange = '7d' | '30d' | '90d';
type JobRow = {
  id: string;
  title: string;
  status: string;
  quoted_amount: number | null;
  created_at: string;
  services?: { name?: string | null; category?: string | null } | null;
};

export const AnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [loading, setLoading] = useState(true);
  const [jobRows, setJobRows] = useState<JobRow[]>([]);
  const [userCount, setUserCount] = useState(0);

  const labels = {
    en: { title: 'Live Analytics', bookingValue: 'Booking Value', users: 'Total Users', completedJobs: 'Completed Jobs', avgJobValue: 'Avg Job Value', completionRate: 'Completion Rate', topServices: 'Top Services', recentActivity: 'Recent Activity', last7days: 'Last 7 Days', last30days: 'Last 30 Days', last90days: 'Last 90 Days', loading: 'Loading live metrics…', noActivity: 'No activity in this period', completed: 'Completed', requested: 'Requested', matching: 'Matching', scheduled: 'Scheduled', enRoute: 'En Route', inProgress: 'In Progress', cancelled: 'Cancelled' },
    es: { title: 'Análisis en Vivo', bookingValue: 'Valor de Reservas', users: 'Usuarios Totales', completedJobs: 'Trabajos Completados', avgJobValue: 'Valor Promedio', completionRate: 'Tasa de Finalización', topServices: 'Servicios Principales', recentActivity: 'Actividad Reciente', last7days: 'Últimos 7 Días', last30days: 'Últimos 30 Días', last90days: 'Últimos 90 Días', loading: 'Cargando métricas en vivo…', noActivity: 'No hay actividad en este período', completed: 'Completado', requested: 'Solicitado', matching: 'Buscando proveedor', scheduled: 'Programado', enRoute: 'En camino', inProgress: 'En progreso', cancelled: 'Cancelado' },
    fr: { title: 'Analyses en Direct', bookingValue: 'Valeur des Réservations', users: 'Utilisateurs Totaux', completedJobs: 'Travaux Terminés', avgJobValue: 'Valeur Moyenne', completionRate: 'Taux de Finalisation', topServices: 'Services Principaux', recentActivity: 'Activité Récente', last7days: '7 Derniers Jours', last30days: '30 Derniers Jours', last90days: '90 Derniers Jours', loading: 'Chargement des métriques…', noActivity: 'Aucune activité sur cette période', completed: 'Terminé', requested: 'Demandé', matching: 'Recherche de fournisseur', scheduled: 'Programmé', enRoute: 'En route', inProgress: 'En cours', cancelled: 'Annulé' },
    pt: { title: 'Análises em Tempo Real', bookingValue: 'Valor das Reservas', users: 'Usuários Totais', completedJobs: 'Trabalhos Concluídos', avgJobValue: 'Valor Médio', completionRate: 'Taxa de Conclusão', topServices: 'Principais Serviços', recentActivity: 'Atividade Recente', last7days: 'Últimos 7 Dias', last30days: 'Últimos 30 Dias', last90days: 'Últimos 90 Dias', loading: 'Carregando métricas…', noActivity: 'Nenhuma atividade neste período', completed: 'Concluído', requested: 'Solicitado', matching: 'Buscando fornecedor', scheduled: 'Programado', enRoute: 'A caminho', inProgress: 'Em andamento', cancelled: 'Cancelado' }
  } as const;
  const t = labels[language];
  const rangeDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: jobs, error: jobsError }, { count, error: usersError }] = await Promise.all([
        supabase.from('jobs').select('id,title,status,quoted_amount,created_at,services(name,category)').gte('created_at', since).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);
      if (!mounted) return;
      if (jobsError || usersError) {
        const error = jobsError ?? usersError;
        toast({ title: 'Analytics error', description: error?.message ?? 'Unable to load analytics.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setJobRows((jobs ?? []) as JobRow[]);
      setUserCount(count ?? 0);
      setLoading(false);
    };
    void load();

    const channel = supabase
      .channel('fixfresh-admin-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        if (mounted) void load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        if (mounted) void load();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Fix & Fresh admin analytics realtime channel error');
        }
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [rangeDays, toast]);

  const stats = useMemo(() => {
    const bookingValue = jobRows.reduce((sum, job) => sum + Number(job.quoted_amount ?? 0), 0);
    const completed = jobRows.filter(job => job.status === 'completed').length;
    const cancelled = jobRows.filter(job => job.status === 'cancelled').length;
    const closed = completed + cancelled;
    const completionRate = closed ? Math.round((completed / closed) * 100) : 0;
    const avgJobValue = jobRows.length ? bookingValue / jobRows.length : 0;
    const serviceTotals = new Map<string, { value: number; count: number }>();
    jobRows.forEach(job => {
      const name = job.services?.name || 'Other';
      const current = serviceTotals.get(name) ?? { value: 0, count: 0 };
      current.value += Number(job.quoted_amount ?? 0);
      current.count += 1;
      serviceTotals.set(name, current);
    });
    const topServices = Array.from(serviceTotals.entries()).sort((a, b) => b[1].value - a[1].value).slice(0, 5);
    return { bookingValue, completed, completionRate, avgJobValue, topServices, closed };
  }, [jobRows]);

  const statusLabel = (status: string) => ({ completed: t.completed, cancelled: t.cancelled, requested: t.requested, matching: t.matching, scheduled: t.scheduled, en_route: t.enRoute, in_progress: t.inProgress }[status] ?? status);
  const metrics = [
    { title: t.bookingValue, value: '$' + stats.bookingValue.toFixed(2), icon: <DollarSign className='h-4 w-4' /> },
    { title: t.users, value: String(userCount), icon: <Users className='h-4 w-4' /> },
    { title: t.completedJobs, value: String(stats.completed), icon: <Target className='h-4 w-4' /> },
    { title: t.avgJobValue, value: '$' + stats.avgJobValue.toFixed(2), icon: <TrendingUp className='h-4 w-4' /> }
  ];
  if (loading) return <div className='p-6 text-slate-500'>{t.loading}</div>;
  const maxServiceValue = Math.max(...stats.topServices.map(([, data]) => data.value), 1);
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-2xl font-bold flex items-center gap-2'><BarChart3 className='h-6 w-6' />{t.title}</h2>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}><TabsList><TabsTrigger value='7d'>{t.last7days}</TabsTrigger><TabsTrigger value='30d'>{t.last30days}</TabsTrigger><TabsTrigger value='90d'>{t.last90days}</TabsTrigger></TabsList></Tabs>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>{metrics.map(metric => <Card key={metric.title}><CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'><CardTitle className='text-sm font-medium'>{metric.title}</CardTitle>{metric.icon}</CardHeader><CardContent><div className='text-2xl font-bold'>{metric.value}</div><p className='text-xs text-muted-foreground mt-1'>{rangeDays}-day period</p></CardContent></Card>)}</div>
      <Card><CardHeader><CardTitle>{t.completionRate}</CardTitle></CardHeader><CardContent><div className='flex items-center justify-between mb-2'><span className='text-sm text-slate-600'>{stats.completed} completed / {stats.closed} closed</span><span className='font-semibold'>{stats.completionRate}%</span></div><Progress value={stats.completionRate} className='h-2' /></CardContent></Card>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card><CardHeader><CardTitle>{t.topServices}</CardTitle></CardHeader><CardContent className='space-y-4'>{stats.topServices.length === 0 ? <p className='text-slate-500'>{t.noActivity}</p> : stats.topServices.map(([name, data]) => <div key={name} className='space-y-2'><div className='flex justify-between items-center'><span className='text-sm font-medium'>{name}</span><span className='text-sm text-muted-foreground'>${data.value.toFixed(2)} · {data.count}</span></div><Progress value={(data.value / maxServiceValue) * 100} className='h-2' /></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>{t.recentActivity}</CardTitle></CardHeader><CardContent className='space-y-3'>{jobRows.slice(0, 6).map(job => <div key={job.id} className='flex items-center gap-3 rounded-lg border p-3'><div className='w-2 h-2 rounded-full bg-slate-400' /><div className='flex-1 min-w-0'><p className='text-sm font-medium truncate'>{job.title}</p><p className='text-xs text-muted-foreground'>{statusLabel(job.status)} · {new Date(job.created_at).toLocaleString()}</p></div><Badge variant='outline'>{'$' + Number(job.quoted_amount ?? 0).toFixed(2)}</Badge></div>)}{jobRows.length === 0 && <p className='text-slate-500'>{t.noActivity}</p>}</CardContent></Card>
      </div>
    </div>
  );
};