import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://idnveskcyxavoaatwtrc.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnZlc2tjeXhhdm9hYXR3dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDk1MTIsImV4cCI6MjA2ODA4NTUxMn0.GrMvnn5AO5OndA2GDMXrn8O2dR0n9iUrqkj9Zrguwyg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
