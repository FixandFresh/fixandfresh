import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const TestAccountCreator: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const createTestAccounts = async () => {
    setCreating(true);
    setMessage('');

    try {
      // Create test client account
      const clientResult = await supabase.auth.signUp({
        email: 'client@test.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test Client',
            username: 'testclient',
            phone: '+1234567890',
            role: 'client',
            status: 'active'
          }
        }
      });

      // Create test provider account
      const providerResult = await supabase.auth.signUp({
        email: 'provider@test.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test Provider',
            username: 'testprovider',
            phone: '+1234567891',
            role: 'provider',
            status: 'active',
            provider_type: 'individual'
          }
        }
      });

      if (clientResult.error && !clientResult.error.message.includes('already registered')) {
        throw clientResult.error;
      }
      
      if (providerResult.error && !providerResult.error.message.includes('already registered')) {
        throw providerResult.error;
      }

      setMessage('Test accounts created successfully! You can now use the quick login buttons.');
    } catch (error: any) {
      console.error('Error creating test accounts:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={createTestAccounts}
        disabled={creating}
      >
        {creating ? 'Creating Test Accounts...' : 'Create Test Accounts'}
      </Button>
      {message && (
        <Alert>
          <AlertDescription className="text-xs">{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TestAccountCreator;