import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export default function NetworkDiagnostic() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic fetch to Supabase
    try {
      const response = await fetch('https://idnveskcyxavoaatwtrc.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZlc2tjeXhhdm9hYXR3dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTQ4NDAsImV4cCI6MjA2ODA5MDg0MH0.LzwgUNVnQQUqEfnGFLmTJjQNsXaZGKCqGFhPYyJNFBE'
        }
      });
      addResult('Basic Fetch', 'success', `Status: ${response.status}`, { headers: Object.fromEntries(response.headers.entries()) });
    } catch (error: any) {
      addResult('Basic Fetch', 'error', error.message, error);
    }

    // Test 2: Supabase client connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        addResult('Supabase Client', 'error', error.message, error);
      } else {
        addResult('Supabase Client', 'success', 'Connection successful', data);
      }
    } catch (error: any) {
      addResult('Supabase Client', 'error', error.message, error);
    }

    // Test 3: Auth status
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult('Auth Session', 'error', error.message, error);
      } else {
        addResult('Auth Session', 'success', session ? 'User logged in' : 'No active session', { session: !!session });
      }
    } catch (error: any) {
      addResult('Auth Session', 'error', error.message, error);
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Network Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running Diagnostics...' : 'Run Network Diagnostics'}
        </Button>
        
        <div className="space-y-2">
          {results.map((result, index) => (
            <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>
                <div className="font-semibold">{result.test}</div>
                <div>{result.message}</div>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Details</summary>
                    <pre className="text-xs mt-1 overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}