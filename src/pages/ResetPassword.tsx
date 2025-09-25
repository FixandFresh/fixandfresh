import React from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import Logo from '@/components/Logo';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;