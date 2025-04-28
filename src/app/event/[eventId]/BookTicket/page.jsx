import TicketBooking from "@/components/TicketBooking";
import React from "react";

function Eventpage({ params }) {
  const { eventId } = params; // Extract eventId from params
  console.log("Event ID:", eventId); // Log the eventId for debugging
  return (
    <div>
      <TicketBooking eventId={eventId} />
    </div>
  );
}

export default Eventpage;
