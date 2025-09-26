// src/pages/Admin.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // make sure this points to your supabase client

type Booking = {
  id: string;
  client_id: string | null;
  service_type: string;
  date: string;
  status: string;
  created_at: string;
};

const Admin: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings from Supabase
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  // Load data on mount
  useEffect(() => {
    fetchBookings();

    // Realtime subscription for new bookings
    const channel = supabase
      .channel("bookings-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          setBookings((prev) => [payload.new as Booking, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Client</th>
              <th className="py-2 px-4">Service</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="py-2 px-4">{booking.id.slice(0, 6)}</td>
                <td className="py-2 px-4">{booking.client_id || "Guest"}</td>
                <td className="py-2 px-4">{booking.service_type}</td>
                <td className="py-2 px-4">
                  {new Date(booking.date).toLocaleString()}
                </td>
                <td className="py-2 px-4">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
