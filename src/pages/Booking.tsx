// src/pages/Booking.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Booking() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.from("bookings").insert([
      {
        name,
        email,
        service,
        date,
        status: "pending",
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error booking service:", error.message);
      alert("There was an error booking your service. Please try again.");
    } else {
      console.log("Booking created:", data);
      setSuccess(true);

      // reset form
      setName("");
      setEmail("");
      setService("");
      setDate("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Book a Service
        </h2>

        {success && (
          <p className="text-green-600 text-center mb-4">
            Booking successful! We’ll contact you soon.
          </p>
        )}

        <input
          type="text"
          placeholder="Your Name"
          className="w-full border rounded p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Your Email"
          className="w-full border rounded p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Service Needed"
          className="w-full border rounded p-2 mb-3"
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full border rounded p-2 mb-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Booking..." : "Submit Booking"}
        </button>
      </form>
    </div>
  );
}
