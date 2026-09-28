import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { serviceCategories } from '@/data/services';
import { serviceTranslations } from '@/data/serviceTranslations';
import { Service } from '@/types/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ServiceDetailModal from './ServiceDetailModal';
import { toast } from '@/components/ui/use-toast';

interface ServicesListProps {
  onServiceSelect?: (service: Service) => void;
  selectedCategory?: string;
}

interface DbServiceRow {
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  category: string | null;
  service_type: string | null;
  unit: string | null;
  market_price: number | null;
  is_add_on: boolean;
  frequency: string | null;
  bundle_services: string[];
  active: boolean;
}

const validCategories = new Set(['residential', 'commercial', 'specialty', 'maintenance', 'bundle']);
const validTypes = new Set(['cleaning', 'restocking', 'repair', 'maintenance']);
const validUnits = new Set(['job', 'hour', 'room', 'load', 'sqft']);
const validFrequencies = new Set(['one-time', 'weekly', 'monthly']);

const mapDbService = (row: DbServiceRow): Service => ({
  id: row.slug,
  name: row.name,
  description: row.description ?? '',
  price: Number(row.base_price ?? 0),
  category: validCategories.has(row.category ?? '') ? row.category as Service['category'] : 'specialty',
  type: validTypes.has(row.service_type ?? '') ? row.service_type as Service['type'] : 'cleaning',
  unit: validUnits.has(row.unit ?? '') ? row.unit as Service['unit'] : 'job',
  marketPrice: row.market_price == null ? undefined : Number(row.market_price),
  isAddOn: Boolean(row.is_add_on),
  frequency: validFrequencies.has(row.frequency ?? '') ? row.frequency as Service['frequency'] : undefined,
  bundleServices: row.bundle_services ?? [],
});

const ServicesList: React.FC<ServicesListProps> = ({ onServiceSelect, selectedCategory }) => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadServices = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('slug,name,description,base_price,category,service_type,unit,market_price,is_add_on,frequency,bundle_services,active')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Failed to load services:', error);
      toast({ title: 'Services unavailable', description: 'We could not load the current service catalog. Please try again.', variant: 'destructive' });
      setServices([]);
    } else {
      setServices((data ?? []).map((row) => mapDbService(row as DbServiceRow)));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadServices();

    const channel = supabase
      .channel('fixfresh-service-catalog')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        if (mounted) void loadServices();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') console.error('Fix & Fresh service catalog realtime channel error');
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [loadServices]);

  const categoriesToShow = useMemo(() => {
    const selected = selectedCategory ? serviceCategories.filter((category) => category.id === selectedCategory) : serviceCategories;
    return selected
      .map((category) => ({ ...category, services: services.filter((service) => service.category === category.id) }))
      .filter((category) => category.services.length > 0);
  }, [selectedCategory, services]);

  const getServiceName = (service: Service) => serviceTranslations[language]?.[service.id] || service.name;
  const handleServiceSelect = (service: Service) => {
    if (onServiceSelect) { onServiceSelect(service); return; }
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) return <div className='py-12 text-center text-slate-500'>Loading current services…</div>;
  if (services.length === 0) return <Card><CardContent className='py-12 text-center text-slate-500'>No services are currently available. Please check back shortly.</CardContent></Card>;

  return (
    <>
      <div className='space-y-8'>
        {categoriesToShow.map((category) => (
          <div key={category.id} className='space-y-6'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl'><span className='text-2xl'>{category.icon}</span></div>
              <div>
                <h3 className='text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>{t(`services.${category.id}`)}</h3>
                <p className='text-sm text-slate-600 font-medium'>{category.description}</p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {category.services.map((service) => (
                <Card key={service.id} className='group cursor-pointer hover:shadow-lg transition-shadow' onClick={() => handleServiceSelect(service)}>
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start gap-3'>
                      <CardTitle className='text-lg group-hover:text-emerald-600 transition-colors'>{getServiceName(service)}</CardTitle>
                      <Badge variant={service.isAddOn ? 'secondary' : 'default'} className={service.isAddOn ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}>{service.isAddOn ? t('services.addOn') : service.type}</Badge>
                    </div>
                    <CardDescription className='text-sm text-slate-600'>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-between items-center gap-3'>
                      <div className='text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>${service.price.toFixed(2)}<span className='text-sm text-slate-500 ml-1'>/{service.unit}</span>{service.frequency && <span className='text-xs text-slate-400 block'>{service.frequency}</span>}</div>
                      <Button size='sm' onClick={(event) => { event.stopPropagation(); handleServiceSelect(service); }} className='ml-2'>{t('services.select')}</Button>
                    </div>
                    {service.marketPrice != null && <div className='text-xs text-slate-500 mt-2 font-medium'>{t('services.market')}: ${service.marketPrice.toFixed(2)}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ServiceDetailModal service={selectedService} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedService(null); }} />
    </>
  );
};

export { ServicesList };
export default ServicesList;