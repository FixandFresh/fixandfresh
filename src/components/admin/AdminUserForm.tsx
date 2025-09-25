import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logAuthError } from '@/utils/errorLogger';

interface AdminUserFormProps {
  onSuccess: () => void;
}

const AdminUserForm: React.FC<AdminUserFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    username: '',
    role: 'client' as 'client' | 'provider' | 'admin',
    providerType: 'individual' as 'individual' | 'company',
    status: 'active' as 'active' | 'pending' | 'suspended'
  });
  
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const isFormValid = (): boolean => {
    return formData.name.trim() !== '' &&
           formData.email.trim() !== '' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
           formData.password.length >= 6 &&
           formData.phone.trim() !== '' &&
           formData.username.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!isFormValid()) {
      setGeneralError('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
            provider_type: formData.role === 'provider' ? formData.providerType : null
          }
        }
      });
      
      if (authError) {
        await logAuthError('admin_user_creation_error', authError.message, formData);
        
        if (authError.message.includes('already registered')) {
          setGeneralError('This email is already registered.');
        } else {
          setGeneralError(authError.message);
        }
        return;
      }
      
      if (authData.user) {
        toast({
          title: 'User Created Successfully!',
          description: `${formData.role} account created for ${formData.name}`
        });
        
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          username: '',
          role: 'client',
          providerType: 'individual',
          status: 'active'
        });
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Admin user creation error:', error);
      await logAuthError('admin_user_creation_unexpected', error.message, formData);
      setGeneralError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New User Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <Alert variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role">User Role *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === 'provider' && (
              <div>
                <Label htmlFor="providerType">Provider Type *</Label>
                <Select value={formData.providerType} onValueChange={(v) => setFormData({...formData, providerType: v as any})}>
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
              <Label htmlFor="status">Account Status *</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Creating Account...' : 'Create User Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminUserForm;