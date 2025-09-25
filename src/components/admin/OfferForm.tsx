import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Offer {
  id?: string;
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

interface OfferFormProps {
  offer?: Offer;
  onSave: (offer: Partial<Offer>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const OfferForm: React.FC<OfferFormProps> = ({ offer, onSave, onCancel, loading }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<Partial<Offer>>(offer || {
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    usageCount: 0
  });

  const translations = {
    en: {
      offerTitle: 'Offer Title',
      description: 'Description',
      discountType: 'Discount Type',
      percentage: 'Percentage',
      fixed: 'Fixed Amount',
      discountValue: 'Discount Value',
      validFrom: 'Valid From',
      validTo: 'Valid To',
      maxUsage: 'Max Usage (Optional)',
      save: 'Save',
      cancel: 'Cancel'
    },
    es: {
      offerTitle: 'Título de Oferta',
      description: 'Descripción',
      discountType: 'Tipo de Descuento',
      percentage: 'Porcentaje',
      fixed: 'Cantidad Fija',
      discountValue: 'Valor de Descuento',
      validFrom: 'Válido Desde',
      validTo: 'Válido Hasta',
      maxUsage: 'Uso Máximo (Opcional)',
      save: 'Guardar',
      cancel: 'Cancelar'
    },
    fr: {
      offerTitle: 'Titre de l\'Offre',
      description: 'Description',
      discountType: 'Type de Remise',
      percentage: 'Pourcentage',
      fixed: 'Montant Fixe',
      discountValue: 'Valeur de Remise',
      validFrom: 'Valide Depuis',
      validTo: 'Valide Jusqu\'à',
      maxUsage: 'Usage Maximum (Optionnel)',
      save: 'Enregistrer',
      cancel: 'Annuler'
    },
    pt: {
      offerTitle: 'Título da Oferta',
      description: 'Descrição',
      discountType: 'Tipo de Desconto',
      percentage: 'Porcentagem',
      fixed: 'Valor Fixo',
      discountValue: 'Valor do Desconto',
      validFrom: 'Válido De',
      validTo: 'Válido Até',
      maxUsage: 'Uso Máximo (Opcional)',
      save: 'Salvar',
      cancel: 'Cancelar'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">{t.offerTitle}</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t.description}</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label>{t.discountType}</Label>
        <Select
          value={formData.discountType}
          onValueChange={(value: 'percentage' | 'fixed') => 
            setFormData(prev => ({ ...prev, discountType: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">{t.percentage}</SelectItem>
            <SelectItem value="fixed">{t.fixed}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="discountValue">{t.discountValue}</Label>
        <Input
          id="discountValue"
          type="number"
          step="0.01"
          value={formData.discountValue || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">{t.validFrom}</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="validTo">{t.validTo}</Label>
          <Input
            id="validTo"
            type="date"
            value={formData.validTo || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="maxUsage">{t.maxUsage}</Label>
        <Input
          id="maxUsage"
          type="number"
          value={formData.maxUsage || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: parseInt(e.target.value) || undefined }))}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !formData.title || !formData.description}>
          <Save className="h-4 w-4 mr-1" />
          {t.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
};