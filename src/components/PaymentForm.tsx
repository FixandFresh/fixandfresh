import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Smartphone, Building } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onPaymentSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [yapyPhone, setYapyPhone] = useState('');
  const [achAccount, setAchAccount] = useState('');

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, call payment API here
      console.log('Processing payment:', { method: paymentMethod, amount });
      
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">{t('payment.expiry')}</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cvv">{t('payment.cvv')}</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div>
            <Label htmlFor="paypalEmail">{t('payment.paypalEmail')}</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="email@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
        );
      case 'yappy':
        return (
          <div>
            <Label htmlFor="yapyPhone">{t('payment.yapyPhone')}</Label>
            <Input
              id="yapyPhone"
              placeholder="+507 1234-5678"
              value={yapyPhone}
              onChange={(e) => setYapyPhone(e.target.value)}
            />
          </div>
        );
      case 'ach':
        return (
          <div>
            <Label htmlFor="achAccount">{t('payment.achAccount')}</Label>
            <Input
              id="achAccount"
              placeholder="Account Number"
              value={achAccount}
              onChange={(e) => setAchAccount(e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('payment.methods')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('payment.selectMethod')}</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder={t('payment.selectMethod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('payment.card')}
                </div>
              </SelectItem>
              <SelectItem value="paypal">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t('payment.paypal')}
                </div>
              </SelectItem>
              <SelectItem value="yappy">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {t('payment.yappy')}
                </div>
              </SelectItem>
              <SelectItem value="ach">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t('payment.ach')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderPaymentFields()}

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>{t('payment.amount')}</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>{t('payment.total')}</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t('form.cancel')}
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!paymentMethod || processing}
            className="flex-1"
          >
            {processing ? t('payment.processing') : t('job.payNow')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};