import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const SignupErrorLogger: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testSignup = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('Starting signup test...');
      addLog(`Email: ${email}`);
      addLog(`Password length: ${password.length}`);
      
      // Test basic network connectivity first
      addLog('Testing basic network connectivity...');
      try {
        const response = await fetch('https://httpbin.org/get');
        addLog(`Network test: ${response.ok ? 'SUCCESS' : 'FAILED'}`);
      } catch (netError: any) {
        addLog(`Network test failed: ${netError.message}`);
      }
      
      // Test Supabase URL accessibility
      addLog('Testing Supabase URL accessibility...');
      try {
        const supabaseResponse = await fetch('https://idnveskcyxavoaatwtrc.supabase.co/rest/v1/', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZlc2tjeXhhdm9hYXR3dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTQ4NDAsImV4cCI6MjA2ODA5MDg0MH0.LzwgUNVnQQUqEfnGFLmTJjQNsXaZGKCqGFhPYyJNFBE'
          }
        });
        addLog(`Supabase REST API: ${supabaseResponse.ok ? 'ACCESSIBLE' : 'FAILED'}`);
      } catch (apiError: any) {
        addLog(`Supabase REST API failed: ${apiError.message}`);
      }
      
      // Now test signup
      addLog('Attempting Supabase signup...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        addLog(`Signup ERROR: ${error.message}`);
        addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
      } else {
        addLog(`Signup SUCCESS: User created with ID ${data.user?.id}`);
        addLog(`User data: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`);
      addLog(`Error stack: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup Error Logger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="test-password">Test Password</Label>
          <Input
            id="test-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>
        
        <Button onClick={testSignup} disabled={loading || !email || !password}>
          {loading ? 'Testing...' : 'Test Signup'}
        </Button>
        
        {logs.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="max-h-64 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {logs.join('\n')}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SignupErrorLogger;