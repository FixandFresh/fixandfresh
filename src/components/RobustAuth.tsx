import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface RobustAuthProps {
  onSuccess: (user: User) => void;
}

const RobustAuth: React.FC<RobustAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'client' | 'provider'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
      } else {
        result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              user_type: userType
            }
          }
        });
      }

      const { data, error: authError } = result;

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          type: userType,
          phone: '',
          username: data.user.email?.split('@')[0] || '',
          isValidated: userType === 'client',
          validationStatus: userType === 'client' ? 'approved' : 'pending'
        };
        
        onSuccess(user);
        toast({
          title: mode === 'login' ? 'Login successful!' : 'Account created!',
          description: `Welcome ${mode === 'login' ? 'back' : 'to Fix & Fresh'}!`
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(`Authentication failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Sign In' : 'Create Account'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'login' ? 'default' : 'outline'}
            onClick={() => setMode('login')}
            className="flex-1"
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === 'signup' ? 'default' : 'outline'}
            onClick={() => setMode('signup')}
            className="flex-1"
          >
            Sign Up
          </Button>
        </div>

        {mode === 'signup' && (
          <>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={userType === 'client' ? 'default' : 'outline'}
                onClick={() => setUserType('client')}
                className="flex-1"
                size="sm"
              >
                Client
              </Button>
              <Button
                type="button"
                variant={userType === 'provider' ? 'default' : 'outline'}
                onClick={() => setUserType('provider')}
                className="flex-1"
                size="sm"
              >
                Provider
              </Button>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              minLength={6}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RobustAuth;