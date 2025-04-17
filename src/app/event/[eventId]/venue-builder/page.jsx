// app/event/[eventId]/venue-builder/page.js
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import VenueBuilder from "@/components/VenueBuilder";
import Loader from "@/components/Loader";

export default function VenueBuilderPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
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
          <button
            onClick={() => router.push("/events")}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueBuilder
        eventId={params.eventId}
        categories={event.categories}
        capacity={event.capacity}
      />
    </div>
  );
}
