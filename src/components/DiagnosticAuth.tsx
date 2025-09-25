import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DiagnosticAuth: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpass123');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSignUp = async () => {
    setLoading(true);
    addLog('Starting sign up test...');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        addLog(`❌ Sign up error: ${error.message}`);
      } else {
        addLog('✓ Sign up successful');
        addLog(`User ID: ${data.user?.id}`);
      }
    } catch (err: any) {
      addLog(`❌ Sign up exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    addLog('Starting sign in test...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addLog(`❌ Sign in error: ${error.message}`);
      } else {
        addLog('✓ Sign in successful');
        addLog(`User ID: ${data.user?.id}`);
      }
    } catch (err: any) {
      addLog(`❌ Sign in exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testSignUp} disabled={loading}>
            Test Sign Up
          </Button>
          <Button onClick={testSignIn} disabled={loading}>
            Test Sign In
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticAuth;