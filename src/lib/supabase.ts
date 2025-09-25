import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct project configuration
const supabaseUrl = 'https://idnveskcyxavoaatwtrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZlc2tjeXhhdm9hYXR3dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTQ4NDAsImV4cCI6MjA2ODA5MDg0MH0.LzwgUNVnQQUqEfnGFLmTJjQNsXaZGKCqGFhPYyJNFBE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
    }
  }
});

export { supabase };