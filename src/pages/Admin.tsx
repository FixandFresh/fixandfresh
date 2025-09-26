// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Booking {
  id: number;
  name: string;
  email: string;
  service: string;
  date: string;
  status: string;
}

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*");

    if (error) {
      console.error("Error fetching bookings:", error.message);
    } else {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  // Listen for new bookings in real-time
  useEffect(() => {
    fetchBookings();

    const subscription = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          console.log("New booking received:", payload.new);
          setBookings((prev) => [...prev, payload.new as Booking]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Service</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{booking.name}</td>
                <td className="p-3 border-b">{booking.email}</td>
                <td className="p-3 border-b">{booking.service}</td>
                <td className="p-3 border-b">
                  {new Date(booking.date).toLocaleDateString()}
                </td>
                <td className="p-3 border-b capitalize">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
