import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { serviceCategories, services } from '@/data/services';
import { Service, ServiceSelection } from '@/types/services';
import { Plus, Minus } from 'lucide-react';

interface ServiceSelectorProps {
  selectedServices: ServiceSelection[];
  onServiceChange: (services: ServiceSelection[]) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ selectedServices, onServiceChange }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleServiceToggle = (service: Service) => {
    const existing = selectedServices.find(s => s.serviceId === service.id);
    if (existing) {
      onServiceChange(selectedServices.filter(s => s.serviceId !== service.id));
    } else {
      const newSelection: ServiceSelection = {
        serviceId: service.id,
        quantity: service.unit === 'room' || service.unit === 'load' ? 1 : undefined
      };
      onServiceChange([...selectedServices, newSelection]);
    }
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [serviceId]: quantity }));
    const updated = selectedServices.map(s => 
      s.serviceId === serviceId ? { ...s, quantity } : s
    );
    onServiceChange(updated);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, selection) => {
      const service = services.find(s => s.id === selection.serviceId);
      if (!service) return total;
      const quantity = selection.quantity || 1;
      return total + (service.price * quantity);
    }, 0);
  };

  const isSelected = (serviceId: string) => selectedServices.some(s => s.serviceId === serviceId);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="residential" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {serviceCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.icon}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {serviceCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            
            <div className="grid gap-4">
              {category.services.map(service => {
                const selected = isSelected(service.id);
                const selection = selectedServices.find(s => s.serviceId === service.id);
                
                return (
                  <Card key={service.id} className={`cursor-pointer transition-all ${
                    selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">{service.name}</CardTitle>
                          <CardDescription className="text-sm">{service.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${service.price}</div>
                          {service.marketPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              Market: ${service.marketPrice}
                            </div>
                          )}
                          <div className="text-xs text-gray-600">/{service.unit}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{service.category}</Badge>
                        {service.frequency && (
                          <Badge variant="outline">{service.frequency}</Badge>
                        )}
                        {service.isAddOn && (
                          <Badge variant="outline">Add-on</Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        {(service.unit === 'room' || service.unit === 'load') && selected && (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Quantity:</Label>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateQuantity(service.id, Math.max(1, (selection?.quantity || 1) - 1))}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{selection?.quantity || 1}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateQuantity(service.id, (selection?.quantity || 1) + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => handleServiceToggle(service)}
                          variant={selected ? "destructive" : "default"}
                          size="sm"
                        >
                          {selected ? 'Remove' : 'Add Service'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {selectedServices.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedServices.map(selection => {
                const service = services.find(s => s.id === selection.serviceId);
                if (!service) return null;
                const quantity = selection.quantity || 1;
                const subtotal = service.price * quantity;
                
                return (
                  <div key={selection.serviceId} className="flex justify-between items-center">
                    <span className="text-sm">
                      {service.name} {quantity > 1 && `(${quantity}x)`}
                    </span>
                    <span className="font-medium">${subtotal}</span>
                  </div>
                );
              })}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceSelector;