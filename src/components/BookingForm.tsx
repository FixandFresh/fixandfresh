import { useState } from 'react'
import { createBooking } from '../lib/booking'
import { notifyAdmin } from '../lib/notifications'

export const BookingForm = () => {
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const { data, error } = await createBooking({ client_name: name, service, message, status: 'pending' })
    if (error) return console.error(error)

    await notifyAdmin('New Booking', `${name} booked: ${service}`)
    alert('Booking sent!')
  }

  return (
    <div>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Service" value={service} onChange={e => setService(e.target.value)} />
      <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSubmit}>Book Now</button>
    </div>
  )
}
