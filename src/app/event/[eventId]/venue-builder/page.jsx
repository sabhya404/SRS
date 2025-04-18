// app/event/[eventId]/venue-builder/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import VenueBuilder from "@/components/venueBuilder/index";

export default function VenueBuilderPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/event/${params.eventId}`);
        if (!response.data) {
          throw new Error("Event not found");
        }
        setEvent(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        alert(err.response?.data?.error || err.message);
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.eventId) {
      fetchEvent();
    }
  }, [params.eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
        <span className="ml-2 text-gray-600">Loading event details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-red-600 font-semibold text-xl mb-2">
            Error Loading Event
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button variant="destructive" onClick={() => router.push("/events")}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button onClick={() => router.push("/events")}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueBuilder eventId={params.eventId} event={event} />
    </div>
  );
}
