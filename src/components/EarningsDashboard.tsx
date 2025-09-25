import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import WithdrawalForm from './WithdrawalForm';

interface EarningsDashboardProps {
  user: User;
}

interface WalletData {
  balance: number;
  totalEarnings: number;
  pendingPayments: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  amount: number;
  type: 'earning' | 'withdrawal' | 'commission';
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
}

const EarningsDashboard: React.FC<EarningsDashboardProps> = ({ user }) => {
  const { t } = useLanguage();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    transactions: []
  });
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [user.id]);

  const loadWalletData = async () => {
    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        setWalletData({
          balance: wallet.balance || 0,
          totalEarnings: wallet.total_earnings || 0,
          pendingPayments: wallet.pending_payments || 0,
          transactions: wallet.transactions || []
        });
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (amount: number, method: string, details: any) => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          provider_id: user.id,
          amount,
          method,
          details,
          status: 'pending'
        });

      if (!error) {
        await loadWalletData();
        setShowWithdrawal(false);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  if (loading) {
    return <div className="p-6">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.earnings')}</h1>
        <Button 
          onClick={() => setShowWithdrawal(true)}
          disabled={walletData.balance < 10}
          className="bg-green-600 hover:bg-green-700"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {t('dashboard.withdraw')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.balance')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData.balance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalEarnings')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingPayments')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData.pendingPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walletData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showWithdrawal && (
        <WithdrawalForm
          availableBalance={walletData.balance}
          onWithdraw={handleWithdrawal}
          onCancel={() => setShowWithdrawal(false)}
        />
      )}
    </div>
  );
};

export default EarningsDashboard;