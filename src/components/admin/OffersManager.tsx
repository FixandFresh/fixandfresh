import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Tag, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

export const OffersManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Offer>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Offers Management',
      createOffer: 'Create Offer',
      editOffer: 'Edit Offer',
      offerTitle: 'Offer Title',
      description: 'Description',
      discountType: 'Discount Type',
      percentage: 'Percentage',
      fixed: 'Fixed Amount',
      discountValue: 'Discount Value',
      validFrom: 'Valid From',
      validTo: 'Valid To',
      maxUsage: 'Max Usage',
      status: 'Status',
      usage: 'Usage',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      offerCreated: 'Offer created successfully',
      offerUpdated: 'Offer updated successfully',
      offerDeleted: 'Offer deleted successfully',
      error: 'An error occurred'
    },
    es: {
      title: 'Gestión de Ofertas',
      createOffer: 'Crear Oferta',
      editOffer: 'Editar Oferta',
      offerTitle: 'Título de Oferta',
      description: 'Descripción',
      discountType: 'Tipo de Descuento',
      percentage: 'Porcentaje',
      fixed: 'Cantidad Fija',
      discountValue: 'Valor de Descuento',
      validFrom: 'Válido Desde',
      validTo: 'Válido Hasta',
      maxUsage: 'Uso Máximo',
      status: 'Estado',
      usage: 'Uso',
      actions: 'Acciones',
      active: 'Activo',
      inactive: 'Inactivo',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      offerCreated: 'Oferta creada exitosamente',
      offerUpdated: 'Oferta actualizada exitosamente',
      offerDeleted: 'Oferta eliminada exitosamente',
      error: 'Ocurrió un error'
    },
    fr: {
      title: 'Gestion des Offres',
      createOffer: 'Créer une Offre',
      editOffer: 'Modifier l\'Offre',
      offerTitle: 'Titre de l\'Offre',
      description: 'Description',
      discountType: 'Type de Remise',
      percentage: 'Pourcentage',
      fixed: 'Montant Fixe',
      discountValue: 'Valeur de Remise',
      validFrom: 'Valide Depuis',
      validTo: 'Valide Jusqu\'à',
      maxUsage: 'Usage Maximum',
      status: 'Statut',
      usage: 'Usage',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      offerCreated: 'Offre créée avec succès',
      offerUpdated: 'Offre mise à jour avec succès',
      offerDeleted: 'Offre supprimée avec succès',
      error: 'Une erreur s\'est produite'
    },
    pt: {
      title: 'Gerenciamento de Ofertas',
      createOffer: 'Criar Oferta',
      editOffer: 'Editar Oferta',
      offerTitle: 'Título da Oferta',
      description: 'Descrição',
      discountType: 'Tipo de Desconto',
      percentage: 'Porcentagem',
      fixed: 'Valor Fixo',
      discountValue: 'Valor do Desconto',
      validFrom: 'Válido De',
      validTo: 'Válido Até',
      maxUsage: 'Uso Máximo',
      status: 'Status',
      usage: 'Uso',
      actions: 'Ações',
      active: 'Ativo',
      inactive: 'Inativo',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      offerCreated: 'Oferta criada com sucesso',
      offerUpdated: 'Oferta atualizada com sucesso',
      offerDeleted: 'Oferta excluída com sucesso',
      error: 'Ocorreu um erro'
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    const sampleOffers: Offer[] = [
      {
        id: '1',
        title: 'New Customer Discount',
        description: '20% off first service',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        isActive: true,
        usageCount: 45,
        maxUsage: 100
      },
      {
        id: '2',
        title: 'Weekend Special',
        description: '$10 off weekend bookings',
        discountType: 'fixed',
        discountValue: 10,
        validFrom: '2024-01-01',
        validTo: '2024-06-30',
        isActive: true,
        usageCount: 23
      }
    ];
    setOffers(sampleOffers);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageCount: 0
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData(offer);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) return;
    
    setLoading(true);
    try {
      if (isCreating) {
        const newOffer: Offer = {
          id: Date.now().toString(),
          ...formData as Offer,
          usageCount: 0,
          isActive: true
        };
        setOffers(prev => [...prev, newOffer]);
        
        toast({
          title: t.offerCreated,
          description: newOffer.title
        });
      } else if (editingOffer) {
        setOffers(prev => prev.map(o => 
          o.id === editingOffer.id ? { ...o, ...formData } : o
        ));
        
        toast({
          title: t.offerUpdated,
          description: formData.title
        });
      }
      
      resetForm();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingOffer(null);
    setIsCreating(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      setOffers(prev => prev.filter(o => o.id !== id));
      toast({
        title: t.offerDeleted
      });
    } catch (error) {
      toast({
        title: t.error,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t.title}
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t.createOffer}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.offerTitle}</TableHead>
                <TableHead>{t.discountType}</TableHead>
                <TableHead>{t.discountValue}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.usage}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      <div className="text-sm text-gray-500">{offer.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {offer.discountType === 'percentage' ? t.percentage : t.fixed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                      {offer.isActive ? t.active : t.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.usageCount}{offer.maxUsage ? `/${offer.maxUsage}` : ''}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(offer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};