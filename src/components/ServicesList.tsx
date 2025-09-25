import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { serviceCategories } from '@/data/services';
import { serviceTranslations } from '@/data/serviceTranslations';
import { Service } from '@/types/services';
import { useLanguage } from '@/contexts/LanguageContext';
import ServiceDetailModal from './ServiceDetailModal';

interface ServicesListProps {
  onServiceSelect?: (service: Service) => void;
  selectedCategory?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  onServiceSelect, 
  selectedCategory 
}) => {
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const categoriesToShow = selectedCategory 
    ? serviceCategories.filter(cat => cat.id === selectedCategory)
    : serviceCategories;

  const getServiceName = (service: Service) => {
    return serviceTranslations[language]?.[service.id] || service.name;
  };

  const handleServiceSelect = (service: Service) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    } else {
      setSelectedService(service);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <>
      <div className="space-y-8">
        {categoriesToShow.map((category) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <span className="text-2xl">{category.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t(`services.${category.id}`)}</h3>
                <p className="text-sm text-slate-600 font-medium">{category.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.services.map((service) => (
                <Card key={service.id} className="group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleServiceSelect(service)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">{getServiceName(service)}</CardTitle>
                      <Badge 
                        variant={service.isAddOn ? "secondary" : "default"}
                        className={service.isAddOn ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"}
                      >
                        {service.isAddOn ? t('services.addOn') : service.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-slate-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${service.price}
                        <span className="text-sm text-slate-500 ml-1">/{service.unit}</span>
                        {service.frequency && (
                          <span className="text-xs text-slate-400 block">
                            {service.frequency}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceSelect(service);
                        }}
                        className="ml-2"
                      >
                        {t('services.select')}
                      </Button>
                    </div>
                    {service.marketPrice && (
                      <div className="text-xs text-slate-500 mt-2 font-medium">
                        {t('services.market')}: ${service.marketPrice}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <ServiceDetailModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export { ServicesList };
export default ServicesList;