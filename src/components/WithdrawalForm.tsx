import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface WithdrawalFormProps {
  availableBalance: number;
  onWithdraw: (amount: number, method: string, details: any) => void;
  onCancel: () => void;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  availableBalance,
  onWithdraw,
  onCancel
}) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount < 10 || withdrawAmount > availableBalance) {
      return;
    }

    setIsSubmitting(true);
    
    const details = method === 'bank' 
      ? { bankAccount }
      : { phoneNumber };
    
    await onWithdraw(withdrawAmount, method, details);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.withdraw')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Available Balance: ${availableBalance.toFixed(2)}</Label>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (Min: $10)</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                max={availableBalance}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Withdrawal Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer (ACH)</SelectItem>
                  <SelectItem value="yappy">Yappy (Mobile Wallet)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'bank' && (
              <div>
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Enter your bank account number"
                  required
                />
              </div>
            )}

            {method === 'yappy' && (
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || !method || parseFloat(amount) < 10}
                className="flex-1"
              >
                {isSubmitting ? t('common.loading') : t('dashboard.withdraw')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                {t('form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalForm;