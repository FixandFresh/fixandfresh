import { useEffect, useState } from 'react'
import { getBookings } from '../../lib/booking'

export const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await getBookings()
      if (error) console.error(error)
      else setBookings(data)
    }
    fetchBookings()
  }, [])

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {bookings.map(b => (
          <li key={b.id}>{b.client_name} - {b.service} - {b.status}</li>
        ))}
      </ul>
    </div>
  )
}
