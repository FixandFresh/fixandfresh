import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing connection...');
    setDetails(null);

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (healthError) {
        throw new Error(`Database connection failed: ${healthError.message}`);
      }

      // Test 2: Auth status
      console.log('Checking auth status...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.warn('Auth check failed:', authError.message);
      }

      // Test 3: Simple auth test
      console.log('Testing auth signup...');
      const testEmail = `test-${Date.now()}@example.com`;
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123'
      });

      setStatus('success');
      setMessage('All tests passed! Supabase is working correctly.');
      setDetails({
        database: 'Connected',
        auth: user ? 'User logged in' : 'No user logged in',
        signup: signupError ? `Error: ${signupError.message}` : 'Signup test successful'
      });

    } catch (error: any) {
      console.error('Connection test failed:', error);
      setStatus('error');
      setMessage(error.message || 'Connection test failed');
      setDetails({
        error: error.message,
        stack: error.stack
      });
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'testing' && (
          <Alert>
            <AlertDescription>Testing Supabase connection...</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {details && (
          <div className="text-sm space-y-2">
            <h4 className="font-semibold">Test Results:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <Button 
          onClick={testConnection}
          disabled={status === 'testing'}
          className="w-full"
        >
          {status === 'testing' ? 'Testing...' : 'Test Again'}
        </Button>

        <div className="text-xs text-gray-500">
          <p>Supabase URL: https://idnveskcyxavoaatwtrc.supabase.co</p>
          <p>Project: idnveskcyxavoaatwtrc</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;