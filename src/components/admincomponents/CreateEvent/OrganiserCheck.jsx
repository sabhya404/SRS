"use client";
import { useRouter } from "next/navigation";

export const OrganizerCheck = ({ router }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-12 rounded-xl shadow-lg text-center max-w-md">
        <div className="mb-6 text-red-500">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V9m0 0V7m0 2h2m-2 0H9"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Organizer Access Required
        </h2>
        <p className="text-gray-600 mb-6">
          You need organizer privileges to create new events.
        </p>
        <button
          onClick={() => router.push("/LandingPage")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md w-full font-medium"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};
