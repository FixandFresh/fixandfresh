import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, DollarSign, Clock, User, Briefcase, History, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import ServicesList from './ServicesList';
import ServiceDetailModal from './ServiceDetailModal';

interface Job {
  id: string;
  title: string;
  description: string;
  client_name: string;
  client_email: string;
  address: string;
  status: string;
  price: number;
  service_type: string;
  scheduled_date: string;
  created_at: string;
  provider_id?: string;
}

interface ClientDashboardProps {
  user: any;
  jobs: any[];
  onCreateJob: () => void;
  onViewJob: (job: any) => void;
  searchQuery: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  user, 
  jobs, 
  onCreateJob, 
  onViewJob, 
  searchQuery 
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Use the jobs passed as props instead of fetching from Supabase
  const myRequests = jobs || [];

  const translations = {
    en: {
      title: 'Client Dashboard',
      services: 'Browse Services',
      myRequests: 'My Requests',
      history: 'History',
      requestService: 'Request Service',
      viewDetails: 'View Details',
      noRequests: 'No service requests yet',
      loading: 'Loading requests...'
    },
    es: {
      title: 'Panel del Cliente',
      services: 'Explorar Servicios',
      myRequests: 'Mis Solicitudes',
      history: 'Historial',
      requestService: 'Solicitar Servicio',
      viewDetails: 'Ver Detalles',
      noRequests: 'Aún no hay solicitudes de servicio',
      loading: 'Cargando solicitudes...'
    },
    fr: {
      title: 'Tableau de Bord Client',
      services: 'Parcourir les Services',
      myRequests: 'Mes Demandes',
      history: 'Historique',
      requestService: 'Demander un Service',
      viewDetails: 'Voir Détails',
      noRequests: 'Aucune demande de service pour le moment',
      loading: 'Chargement des demandes...'
    },
    pt: {
      title: 'Painel do Cliente',
      services: 'Navegar Serviços',
      myRequests: 'Minhas Solicitações',
      history: 'Histórico',
      requestService: 'Solicitar Serviço',
      viewDetails: 'Ver Detalhes',
      noRequests: 'Ainda não há solicitações de serviço',
      loading: 'Carregando solicitações...'
    }
  };

  const t = translations[language];
  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleServiceRequest = (requestData: any) => {
    // Use the onCreateJob callback instead of Supabase
    onCreateJob();
    setShowServiceModal(false);
    
    toast({
      title: 'Service Requested!',
      description: 'Your service request has been submitted successfully'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': 
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RequestCard: React.FC<{ request: any }> = ({ request }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewJob(request)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Briefcase className="h-4 w-4" />
              {request.serviceType || request.service_type || 'Service'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {request.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {new Date(request.scheduledDate || request.scheduled_date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            <DollarSign className="h-4 w-4" />
            ${request.price}
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-1 text-xs sm:text-sm">
            <TabsTrigger value="services" className="rounded-lg text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t.services}</span>
              <span className="sm:hidden">Services</span>
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="rounded-lg text-xs sm:text-sm">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t.myRequests}</span>
              <span className="sm:hidden">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm">
              <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t.history}</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>{t.services}</CardTitle>
                <CardDescription>
                  Browse available services and submit requests for cleaning, repairs, and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServicesList onServiceSelect={handleServiceSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <CardTitle>{t.myRequests}</CardTitle>
                <CardDescription>
                  Track your service requests and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>

                {myRequests.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.noRequests}</p>
                    <Button 
                      onClick={() => setActiveTab('services')}
                      className="mt-4"
                    >
                      {t.requestService}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t.history}</CardTitle>
                <CardDescription>
                  View your completed and cancelled service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRequests.filter(r => r.status === 'completed' || r.status === 'cancelled').map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>

                {myRequests.filter(r => r.status === 'completed' || r.status === 'cancelled').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No completed requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showServiceModal && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleServiceRequest}
        />
      )}
    </div>
  );
};

export default ClientDashboard;