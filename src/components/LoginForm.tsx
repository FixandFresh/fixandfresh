import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logAuthError } from '@/utils/errorLogger';
import ForgotPasswordForm from './ForgotPasswordForm';
import TestAccountCreator from './TestAccountCreator';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

interface FormData {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('fixfresh_credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setFormData({
          email: parsed.email || '',
          password: parsed.password || ''
        });
        setRememberMe(true);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('fixfresh_credentials');
      }
    }
  }, []);

  const isFormValid = (): boolean => {
    return formData.email.trim() !== '' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
           formData.password !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!isFormValid()) {
      setGeneralError('Please enter valid email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (authError) {
        await logAuthError('login_auth_error', authError.message, {
          email: formData.email
        });
        
        if (authError.message.includes('Invalid login credentials')) {
          setGeneralError('Invalid email or password. Please check your credentials.');
        } else {
          setGeneralError(authError.message);
        }
        return;
      }
      
      if (!authData.user) {
        setGeneralError('Login failed. Please try again.');
        return;
      }
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('fixfresh_credentials', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('fixfresh_credentials');
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError || !profile) {
        await logAuthError('login_profile_error', 'Profile not found', {
          email: formData.email,
          userId: authData.user.id
        });
        setGeneralError('Could not load user profile. Please contact support.');
        return;
      }
      
      const user: User = {
        id: profile.id,
        name: profile.full_name || '',
        email: profile.email || authData.user.email || '',
        type: profile.role || 'client',
        phone: profile.phone || '',
        username: profile.username || '',
        isValidated: profile.status === 'active',
        validationStatus: profile.status === 'active' ? 'approved' : 'pending',
        providerType: profile.provider_type || undefined
      };
      
      onSuccess(user);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.type}`
      });
    } catch (error: any) {
      console.error('Login error:', error);
      await logAuthError('login_unexpected_error', error.message || 'Unknown error', {
        email: formData.email
      });
      setGeneralError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          autoComplete="current-password"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </Label>
        </div>
        
        <Button
          type="button"
          variant="link"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot password?
        </Button>
      </div>

      {/* Quick login options for testing */}
      <div className="space-y-2 pt-4 border-t">
        <p className="text-sm text-gray-600 text-center">Quick Login (for testing):</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setFormData({ email: 'client@test.com', password: 'password123' });
            }}
          >
            Test Client
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setFormData({ email: 'provider@test.com', password: 'password123' });
            }}
          >
            Test Provider
          </Button>
        </div>
      </div>
      
      <TestAccountCreator />
      
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700" 
        disabled={loading || !isFormValid()}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;