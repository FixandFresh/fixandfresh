// PagueloFacil Payment Service for Panama
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  clientId: string;
  jobId: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface WithdrawalRequest {
  amount: number;
  providerId: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
}

class PagueloFacilService {
  private apiUrl = 'https://api.paguelofacil.com/v1';
  private merchantId: string;
  private apiKey: string;
  private secretKey: string;

  constructor() {
    // In production, these would come from environment variables
    this.merchantId = process.env.PAGUELOFACIL_MERCHANT_ID || 'demo_merchant';
    this.apiKey = process.env.PAGUELOFACIL_API_KEY || 'demo_api_key';
    this.secretKey = process.env.PAGUELOFACIL_SECRET_KEY || 'demo_secret';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // For demo purposes, simulate successful payment creation
      if (this.merchantId === 'demo_merchant') {
        return {
          success: true,
          transactionId: `TXN_${Date.now()}`,
          paymentUrl: `https://demo.paguelofacil.com/pay/${Date.now()}`
        };
      }

      const payload = {
        merchant_id: this.merchantId,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        reference: request.jobId,
        customer: {
          email: request.customerEmail,
          name: request.customerName
        },
        callback_url: `${window.location.origin}/payment/callback`,
        return_url: `${window.location.origin}/payment/success`
      };

      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: data.transaction_id,
          paymentUrl: data.payment_url
        };
      } else {
        return {
          success: false,
          error: data.message || 'Payment creation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; amount?: number }> {
    try {
      // For demo purposes, simulate successful verification
      if (this.merchantId === 'demo_merchant') {
        return {
          success: true,
          status: 'completed',
          amount: 100 // Demo amount
        };
      }

      const response = await fetch(`${this.apiUrl}/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: data.status,
        amount: data.amount
      };
    } catch (error) {
      return {
        success: false,
        status: 'error'
      };
    }
  }

  async processWithdrawal(request: WithdrawalRequest): Promise<{ success: boolean; withdrawalId?: string; error?: string }> {
    try {
      // For demo purposes, simulate successful withdrawal
      if (this.merchantId === 'demo_merchant') {
        return {
          success: true,
          withdrawalId: `WD_${Date.now()}`
        };
      }

      const payload = {
        amount: request.amount,
        provider_id: request.providerId,
        bank_account: request.bankAccount,
        bank_name: request.bankName,
        account_holder: request.accountHolder
      };

      const response = await fetch(`${this.apiUrl}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          withdrawalId: data.withdrawal_id
        };
      } else {
        return {
          success: false,
          error: data.message || 'Withdrawal failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  calculateCommission(amount: number): { providerEarnings: number; platformCommission: number } {
    const commissionRate = 0.2; // 20% platform commission
    const platformCommission = amount * commissionRate;
    const providerEarnings = amount - platformCommission;

    return {
      providerEarnings,
      platformCommission
    };
  }
}

export const pagueloFacilService = new PagueloFacilService();