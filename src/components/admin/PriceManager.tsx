import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, DollarSign, Save, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { serviceCategories } from '@/data/services';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PriceData {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  currency: string;
  lastUpdated: string;
}

export const PriceManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [editingPrice, setEditingPrice] = useState<PriceData | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Price Management',
      service: 'Service',
      category: 'Category',
      price: 'Price',
      lastUpdated: 'Last Updated',
      actions: 'Actions',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      editPrice: 'Edit Service Price & Category',
      newPrice: 'New Price',
      selectCategory: 'Select Category',
      priceUpdated: 'Service updated successfully',
      errorUpdating: 'Error updating service'
    },
    es: {
      title: 'Gestión de Precios',
      service: 'Servicio',
      category: 'Categoría',
      price: 'Precio',
      lastUpdated: 'Última Actualización',
      actions: 'Acciones',
      edit: 'Editar',
      save: 'Guardar',
      cancel: 'Cancelar',
      editPrice: 'Editar Precio y Categoría del Servicio',
      newPrice: 'Nuevo Precio',
      selectCategory: 'Seleccionar Categoría',
      priceUpdated: 'Servicio actualizado exitosamente',
      errorUpdating: 'Error al actualizar servicio'
    },
    fr: {
      title: 'Gestion des Prix',
      service: 'Service',
      category: 'Catégorie',
      price: 'Prix',
      lastUpdated: 'Dernière Mise à Jour',
      actions: 'Actions',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      editPrice: 'Modifier Prix et Catégorie du Service',
      newPrice: 'Nouveau Prix',
      selectCategory: 'Sélectionner Catégorie',
      priceUpdated: 'Service mis à jour avec succès',
      errorUpdating: 'Erreur lors de la mise à jour du service'
    },
    pt: {
      title: 'Gerenciamento de Preços',
      service: 'Serviço',
      category: 'Categoria',
      price: 'Preço',
      lastUpdated: 'Última Atualização',
      actions: 'Ações',
      edit: 'Editar',
      save: 'Salvar',
      cancel: 'Cancelar',
      editPrice: 'Editar Preço e Categoria do Serviço',
      newPrice: 'Novo Preço',
      selectCategory: 'Selecionar Categoria',
      priceUpdated: 'Serviço atualizado com sucesso',
      errorUpdating: 'Erro ao atualizar serviço'
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      // Load saved prices from database
      const { data: savedPrices } = await supabase
        .from('admin_settings')
        .select('*')
        .like('key', 'price_%');
      
      const { data: savedCategories } = await supabase
        .from('admin_settings')
        .select('*')
        .like('key', 'category_%');
      
      const priceMap = new Map();
      const categoryMap = new Map();
      
      savedPrices?.forEach(item => {
        const serviceId = item.key.replace('price_', '');
        priceMap.set(serviceId, parseFloat(item.value));
      });
      
      savedCategories?.forEach(item => {
        const serviceId = item.key.replace('category_', '');
        categoryMap.set(serviceId, item.value);
      });
      
      const allServices = serviceCategories.flatMap(category => 
        category.services.map(service => ({
          id: service.id,
          name: service.name,
          category: categoryMap.get(service.id) || category.name,
          basePrice: priceMap.get(service.id) || service.price,
          currency: 'USD',
          lastUpdated: new Date().toLocaleDateString()
        }))
      );
      setPrices(allServices);
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

  const handleEditClick = (price: PriceData) => {
    setEditingPrice(price);
    setNewPrice(price.basePrice.toString());
    setNewCategory(price.category);
    setIsDialogOpen(true);
  };

  const handleSavePrice = async () => {
    if (!editingPrice || !newPrice || !newCategory) return;
    
    setLoading(true);
    try {
      const updatedPrice = parseFloat(newPrice);
      
      // Update local state
      setPrices(prev => prev.map(p => 
        p.id === editingPrice.id 
          ? { ...p, basePrice: updatedPrice, category: newCategory, lastUpdated: new Date().toLocaleDateString() }
          : p
      ));
      
      // Save price to database
      const { error: priceError } = await supabase
        .from('admin_settings')
        .upsert({
          key: `price_${editingPrice.id}`,
          value: updatedPrice.toString(),
          updated_at: new Date().toISOString()
        });
      
      // Save category to database
      const { error: categoryError } = await supabase
        .from('admin_settings')
        .upsert({
          key: `category_${editingPrice.id}`,
          value: newCategory,
          updated_at: new Date().toISOString()
        });
      
      if (priceError || categoryError) throw priceError || categoryError;
      
      toast({
        title: t.priceUpdated,
        description: `${editingPrice.name}: $${updatedPrice} - ${newCategory}`
      });
      
      setIsDialogOpen(false);
      setEditingPrice(null);
      setNewPrice('');
      setNewCategory('');
    } catch (error) {
      toast({
        title: t.errorUpdating,
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingPrice(null);
    setNewPrice('');
    setNewCategory('');
  };

  const categoryOptions = serviceCategories.map(cat => ({
    value: cat.name,
    label: cat.name
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.service}</TableHead>
              <TableHead>{t.category}</TableHead>
              <TableHead>{t.price}</TableHead>
              <TableHead>{t.lastUpdated}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((price) => (
              <TableRow key={price.id}>
                <TableCell className="font-medium">{price.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{price.category}</Badge>
                </TableCell>
                <TableCell>${price.basePrice}</TableCell>
                <TableCell>{price.lastUpdated}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(price)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t.edit}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t.editPrice}: {editingPrice?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">{t.category}</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">{t.newPrice}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter new price"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSavePrice} 
                  disabled={loading || !newPrice || !newCategory}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t.save}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};