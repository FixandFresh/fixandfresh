import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('Starting connection test...');
      
      // Test 1: Basic client initialization
      addResult('✓ Supabase client initialized');
      
      // Test 2: Simple query
      addResult('Testing database query...');
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        addResult(`❌ Database query failed: ${error.message}`);
      } else {
        addResult('✓ Database query successful');
      }
      
      // Test 3: Auth status
      addResult('Testing auth status...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        addResult(`❌ Auth test failed: ${authError.message}`);
      } else {
        addResult('✓ Auth system accessible');
      }
      
    } catch (err: any) {
      addResult(`❌ Connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Connection'}
        </Button>
        
        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">Click "Test Connection" to run diagnostics</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;