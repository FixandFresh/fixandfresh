import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function BookingPage() {
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.from("bookings").insert([
      {
        client_email: email,
        service,
        date,
        status: "pending",
      },
    ]);

    if (error) {
      alert("Booking failed: " + error.message);
    } else {
      alert("Booking submitted!");
      // send email notification
      await fetch("/api/send-booking-email", {
        method: "POST",
        body: JSON.stringify({ email, service, date }),
      });
    }
  };

  return (
    <form onSubmit={handleBooking}>
      <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Service" value={service} onChange={(e) => setService(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">Book Service</button>
    </form>
  );
}
