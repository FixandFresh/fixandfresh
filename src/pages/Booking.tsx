import { supabase } from '../lib/supabaseClient'

async function createBooking(userId, serviceId, scheduledAt) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ user_id: userId, service_id: serviceId, status: 'pending', scheduled_at: scheduledAt }])
  
  if (error) console.error(error)
  else {
    console.log('Booking created:', data)
    sendAdminNotification(data[0])
  }
}
