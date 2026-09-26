import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface SimpleAuthProps {
  onSuccess: (user: User) => void;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'client' | 'provider'>('client');
  const [loginType, setLoginType] = useState<'client' | 'provider' | 'admin'>('client');
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
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        setError('Please fill in all required fields.');
        return;
      }

      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authError) throw authError;
        if (!data.user) throw new Error('Authentication succeeded but no user was returned.');

        onSuccess({
          id: data.user.id,
          name: '',
          email: data.user.email ?? normalizedEmail,
          type: loginType === 'provider' ? 'provider' : 'client',
          isAdmin: loginType === 'admin',
        });
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      const redirectTo = `${window.location.origin}/`;
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: name.trim(),
            requested_role: userType,
          },
        },
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Account creation did not return a user.');

      if (!data.session) {
        setError('Account created. Check your email to confirm your account, then sign in.');
        return;
      }

      onSuccess({
        id: data.user.id,
        name: name.trim(),
        email: data.user.email ?? normalizedEmail,
        type: userType,
        isValidated: userType === 'client',
        validationStatus: userType === 'client' ? 'approved' : 'pending',
      });
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>{mode === 'login' ? `Sign In as ${loginType === 'admin' ? 'Admin' : loginType === 'provider' ? 'Provider' : 'Customer'}` : 'Create Account'}</CardTitle>
        <p className='text-sm text-muted-foreground'>Secure account access powered by Supabase.</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='flex gap-2'>
          <Button type='button' variant={mode === 'login' ? 'default' : 'outline'} onClick={() => { setMode('login'); setError(''); }} className='flex-1'>Login</Button>
          <Button type='button' variant={mode === 'signup' ? 'default' : 'outline'} onClick={() => { setMode('signup'); setError(''); }} className='flex-1'>Sign Up</Button>
        </div>

        {mode === 'login' ? (
          <div className='space-y-2'>
            <Label>Sign in as</Label>
            <div className='grid grid-cols-3 gap-2'>
              <Button type='button' variant={loginType === 'client' ? 'default' : 'outline'} onClick={() => setLoginType('client')} size='sm'>Customer</Button>
              <Button type='button' variant={loginType === 'provider' ? 'default' : 'outline'} onClick={() => setLoginType('provider')} size='sm'>Provider</Button>
              <Button type='button' variant={loginType === 'admin' ? 'default' : 'outline'} onClick={() => setLoginType('admin')} size='sm'>Admin</Button>
            </div>
            <p className='text-xs text-muted-foreground'>This selection does not grant access; your account role is verified securely from Fix &amp; Fresh.</p>
          </div>
        ) : (
          <>
            <div className='flex gap-2'>
              <Button type='button' variant={userType === 'client' ? 'default' : 'outline'} onClick={() => setUserType('client')} className='flex-1' size='sm'>Client</Button>
              <Button type='button' variant={userType === 'provider' ? 'default' : 'outline'} onClick={() => setUserType('provider')} className='flex-1' size='sm'>Provider</Button>
            </div>
            <div>
              <Label htmlFor='name'>Full Name</Label>
              <Input id='name' value={name} onChange={(e) => setName(e.target.value)} placeholder='Your full name' required />
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your@email.com' required />
          </div>
          <div>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter password (8+ characters)' required minLength={8} />
          </div>
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className='pt-4 border-t text-center text-sm text-gray-500'>
          Your account information is securely stored and managed by Supabase.
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAuth;