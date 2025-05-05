"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function EventSuccessPage({ params }) {
  const router = useRouter();
  const eventId = params?.eventId;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Event Created Successfully!
          </h1>
          <p className="text-gray-600 mt-2">
            Your event has been created and is ready to set up.
          </p>
          {eventId && (
            <p className="text-sm text-gray-500 mt-1">Event ID: {eventId}</p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push(`/venue-builder/${eventId}`)}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Set Up Venue Layout
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-md font-medium hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
