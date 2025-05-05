"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const EventSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Log for debugging
  useEffect(() => {
    console.log("URL Parameters:", Object.fromEntries(searchParams.entries()));
    console.log("Event ID from URL:", eventId);
  }, [searchParams, eventId]);

  // Fetch event details from the database
  useEffect(() => {
    if (!eventId) {
      setError("No event ID found. Please try creating your event again.");
      setLoading(false);
      return;
    }

    const fetchEventDetails = async () => {
      try {
        // Fetch actual data from your API
        const response = await fetch(`/api/event/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const data = await response.json();
        setEventDetails(data.event);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Handle redirection to venue builder
  const goToVenueBuilder = () => {
    router.push(`/event/${eventId}/venue-builder`);
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-800 font-medium">
            Loading your event details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Link
              href="/event/create"
              className="block w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-lg text-center transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Back to Create Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state with animations
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mt-4">
            Event Created Successfully!
          </h1>
        </div>

        {/* Event Details Card */}
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <div className="flex items-center mb-4 pb-4 border-b border-blue-100">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-blue-500">
                  EVENT ID
                </div>
                <div className="text-sm font-mono font-medium">{eventId}</div>
              </div>
            </div>

            {eventDetails && (
              <>
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-green-500">
                      EVENT NAME
                    </div>
                    <div className="text-sm font-medium">
                      {eventDetails.title}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={goToVenueBuilder}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Continue to Venue Builder
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>

            <Link
              href="/events"
              className="block w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-center transition duration-300 ease-in-out"
            >
              Go to Events Dashboard
            </Link>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSuccessPage;
