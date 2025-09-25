import React from 'react';
import { User } from '@/types';
import SimpleAuth from './SimpleAuth';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fix & Fresh</h1>
          <p className="text-gray-600">Your trusted service marketplace</p>
        </div>
        <SimpleAuth onSuccess={onAuthSuccess} />
      </div>
    </div>
  );
};

export default AuthForm;