// src/pages/Booking.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase"; //
import { useNavigate } from "react-router-dom";

const Booking: React.FC = () => {
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.from("bookings").insert([
      {
        service_type: serviceType,
        date,
        status: "Pending",
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error creating booking:", error.message);
      alert("❌ Failed to create booking. Try again.");
    } else {
      alert("✅ Booking submitted!");
      navigate("/"); // redirect to home after booking
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book a Service</h1>

      <form onSubmit={handleBooking} className="space-y-4">
        {/* Service Type */}
        <div>
          <label className="block mb-1 font-medium">Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select a service</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Restocking">Restocking</option>
            <option value="Repairs">Repairs</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Book Service"}
        </button>
      </form>
    </div>
  );
};

export default Booking;
