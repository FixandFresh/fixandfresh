import { supabase } from './supabaseClient'

// Create a new booking
export const createBooking = async (bookingData: any) => {
  const { data, error } = await supabase.from('bookings').insert([bookingData])
  return { data, error }
}

// Fetch bookings for admin dashboard
export const getBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
  return { data, error }
}
