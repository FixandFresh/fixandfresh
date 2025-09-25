import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logAuthError } from '@/utils/errorLogger';

interface SignUpFormProps {
  userType: 'client' | 'provider';
  onSuccess: (user: User) => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  providerType?: 'individual' | 'company';
}

const SignUpForm: React.FC<SignUpFormProps> = ({ userType, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    username: '',
    providerType: userType === 'provider' ? 'individual' : undefined
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });
      
      if (authError) {
        await logAuthError('signup_auth_error', authError.message, {
          email: formData.email,
          role: userType,
          name: formData.fullName
        });
        
        if (authError.message.includes('already registered')) {
          setGeneralError('This email is already registered. Please use a different email or try logging in.');
        } else {
          setGeneralError(authError.message);
        }
        return;
      }
      
      if (authData.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            username: formData.username,
            phone: formData.phone,
            role: userType,
            status: userType === 'client' ? 'active' : 'pending',
            provider_type: userType === 'provider' ? formData.providerType : null
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway - profile might be created by trigger
        }
        
        const user: User = {
          id: authData.user.id,
          name: formData.fullName,
          email: formData.email,
          type: userType,
          phone: formData.phone,
          username: formData.username,
          isValidated: userType === 'client',
          validationStatus: userType === 'client' ? 'approved' : 'pending',
          providerType: userType === 'provider' ? formData.providerType : undefined
        };
        
        onSuccess(user);
        toast({
          title: 'Account Created Successfully!',
          description: `Welcome to Fix & Fresh, ${formData.fullName}!`
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      await logAuthError('signup_unexpected_error', error.message || 'Unknown error', {
        email: formData.email,
        role: userType,
        name: formData.fullName
      });
      
      setGeneralError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>
      
      <div>
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className={errors.username ? 'border-red-500' : ''}
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      {userType === 'provider' && (
        <div>
          <Label htmlFor="providerType">Provider Type *</Label>
          <Select 
            value={formData.providerType} 
            onValueChange={(v) => setFormData({...formData, providerType: v as 'individual' | 'company'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700" 
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 
         userType === 'provider' ? 'Create Provider Account' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignUpForm;