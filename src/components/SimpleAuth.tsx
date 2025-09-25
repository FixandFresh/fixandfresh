import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface SimpleAuthProps {
  onSuccess: (user: User) => void;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ onSuccess }) => {
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!email || !password) {
        setError('Please fill in all required fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const user: User = {
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        type: userType,
        phone: '',
        username: email.split('@')[0],
        isValidated: userType === 'client',
        validationStatus: userType === 'client' ? 'approved' : 'pending'
      };

      onSuccess(user);
      toast({
        title: mode === 'login' ? 'Login successful!' : 'Account created!',
        description: `Welcome ${mode === 'login' ? 'back' : 'to Fix & Fresh'}!`
      });

    } catch (err: any) {
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoType: 'client' | 'provider') => {
    const user: User = {
      id: `demo-${demoType}-${Date.now()}`,
      name: `Demo ${demoType.charAt(0).toUpperCase() + demoType.slice(1)}`,
      email: `demo@${demoType}.com`,
      type: demoType,
      phone: '+1234567890',
      username: `demo${demoType}`,
      isValidated: demoType === 'client',
      validationStatus: demoType === 'client' ? 'approved' : 'pending'
    };

    onSuccess(user);
    toast({
      title: 'Demo Login Successful!',
      description: `Welcome to Fix & Fresh as a ${demoType}!`
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
          <div className="text-sm font-normal text-blue-600 mt-1">
            Simple Authentication
          </div>
        </CardTitle>
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
              placeholder="Enter password (min 6 chars)"
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

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm text-gray-600 text-center">Quick Demo Access:</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleDemoLogin('client')}
            >
              Demo Client
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleDemoLogin('provider')}
            >
              Demo Provider
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAuth;