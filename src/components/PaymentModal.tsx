import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ExternalLink, Shield, Clock } from 'lucide-react';
import { Job, User } from '@/types';
import { pagueloFacilService } from '@/lib/paguelofacil';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  user: User;
  onPaymentSuccess: (transactionId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  job,
  user,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const commission = pagueloFacilService.calculateCommission(job.price);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const paymentRequest = {
        amount: job.price,
        currency: 'USD',
        description: `Payment for ${job.title}`,
        clientId: user.id,
        jobId: job.id,
        customerEmail: user.email,
        customerName: user.name
      };

      const response = await pagueloFacilService.createPayment(paymentRequest);

      if (response.success && response.paymentUrl) {
        setPaymentUrl(response.paymentUrl);
        toast({
          title: 'Payment Link Created',
          description: 'Click the link below to complete your payment'
        });
      } else {
        toast({
          title: 'Payment Error',
          description: response.error || 'Failed to create payment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // In a real implementation, this would be called via webhook
    // For demo purposes, we'll simulate successful payment
    const transactionId = `TXN_${Date.now()}`;
    onPaymentSuccess(transactionId);
    toast({
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{job.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Amount:</span>
                <span className="font-medium">${job.price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (20%):</span>
                <span className="font-medium">${commission.platformCommission.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Provider Earnings:</span>
                <span className="font-medium text-green-600">${commission.providerEarnings.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total to Pay:</span>
                <span>${job.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-blue-700 text-xs mt-1">
              Your payment is processed securely through PagueloFacil
            </p>
          </div>

          {!paymentUrl ? (
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${job.price.toFixed(2)}
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={() => window.open(paymentUrl, '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Complete Payment
              </Button>
              
              <Button 
                onClick={handlePaymentComplete}
                variant="outline"
                className="w-full"
              >
                I've Completed Payment
              </Button>
            </div>
          )}

          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Powered by PagueloFacil
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};