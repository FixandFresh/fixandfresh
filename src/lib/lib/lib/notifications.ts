import { supabase } from './supabaseClient'

// Send email to admin
export const notifyAdmin = async (subject: string, message: string) => {
  const { data, error } = await supabase.functions.invoke('sendEmail', {
    body: { subject, message }
  })
  return { data, error }
}
