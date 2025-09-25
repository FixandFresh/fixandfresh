import { supabase } from '@/lib/supabase';

interface ErrorLogData {
  error_type: string;
  error_message: string;
  user_data?: {
    email?: string;
    role?: string;
    name?: string;
  };
  timestamp?: string;
}

export const logSignUpError = async (errorData: ErrorLogData) => {
  try {
    const { data, error } = await supabase.functions.invoke('log-signup-error', {
      body: {
        ...errorData,
        timestamp: errorData.timestamp || new Date().toISOString()
      }
    });

    if (error) {
      console.error('Failed to log error to backend:', error);
    }
  } catch (error) {
    console.error('Error logging function failed:', error);
  }
};

export const logAuthError = async (errorType: string, errorMessage: string, userData?: any) => {
  await logSignUpError({
    error_type: errorType,
    error_message: errorMessage,
    user_data: userData ? {
      email: userData.email,
      role: userData.role || userData.type,
      name: userData.name
    } : undefined
  });
};
