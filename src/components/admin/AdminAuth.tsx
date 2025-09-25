import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from '../Logo';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const { language } = useLanguage();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Admin Access',
      subtitle: 'Enter your administrator credentials',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      error: 'Invalid credentials. Please try again.',
      loading: 'Authenticating...'
    },
    es: {
      title: 'Acceso de Administrador',
      subtitle: 'Ingrese sus credenciales de administrador',
      username: 'Usuario',
      password: 'Contraseña',
      login: 'Iniciar Sesión',
      error: 'Credenciales inválidas. Inténtelo de nuevo.',
      loading: 'Autenticando...'
    },
    fr: {
      title: 'Accès Administrateur',
      subtitle: 'Entrez vos identifiants d\'administrateur',
      username: 'Nom d\'utilisateur',
      password: 'Mot de passe',
      login: 'Connexion',
      error: 'Identifiants invalides. Veuillez réessayer.',
      loading: 'Authentification...'
    },
    pt: {
      title: 'Acesso Administrativo',
      subtitle: 'Digite suas credenciais de administrador',
      username: 'Usuário',
      password: 'Senha',
      login: 'Entrar',
      error: 'Credenciais inválidas. Tente novamente.',
      loading: 'Autenticando...'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple authentication check (in production, this would be server-side)
    if (credentials.username === 'admin' && credentials.password === 'JohnMujema') {
      setTimeout(() => {
        onAuthenticated();
        setLoading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        setError(t.error);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <Logo className="flex-shrink-0" />
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{t.title}</CardTitle>
            <p className="text-gray-600">{t.subtitle}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                {loading ? t.loading : t.login}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};