"use client";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  AlertCircle,
} from "lucide-react";

export const ReviewSubmitStep = ({
  formData,
  totalSeatSum,
  error,
  success,
  isSubmitting,
  handleSubmit,
  prevStep,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold border-b pb-3">Review Event</h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-4">Event Details</h4>
          <div className="space-y-2">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(formData.startDate).toLocaleString()}
            </p>
            <p className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(formData.endDate).toLocaleString()}
            </p>
            <p className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Capacity: {formData.capacity}
            </p>
          </div>

          <h4 className="font-medium mt-6 mb-4">Location</h4>
          <div className="space-y-2">
            <p className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {formData.location.address}
            </p>
            <p className="ml-6">
              {formData.location.city}, {formData.location.country}
            </p>
          </div>

          <h4 className="font-medium mt-6 mb-4">Categories</h4>
          <div className="space-y-2">
            {formData.categories.length === 0 ? (
              <p className="text-gray-500 italic">No categories defined</p>
            ) : (
              formData.categories.map((category, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category.name}</span>
                    <span>{category.totalSeats} seats</span>
                  </div>
                  {category.subcategories?.map((sub, subIndex) => (
                    <div key={subIndex} className="ml-4 text-sm">
                      {sub.subName}: {sub.subSeats} seats
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Cover Image</h4>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="Event cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image preview available
              </div>
            )}
          </div>

          <h4 className="font-medium mt-6 mb-4">Capacity Check</h4>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Total Allocated Seats:</span>
              <span
                className={`font-bold ${
                  totalSeatSum !== formData.capacity
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {totalSeatSum} / {formData.capacity}
              </span>
            </div>
            {totalSeatSum !== formData.capacity && (
              <p className="text-red-600 text-sm mt-2">
                Seating allocation must match total capacity
              </p>
            )}
          </div>

          <h4 className="font-medium mt-6 mb-4">Description</h4>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
            {formData.description || "No description provided"}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      <div className="pt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition shadow-md font-medium flex items-center"
        >
          <span className="mr-2">←</span> Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || totalSeatSum !== formData.capacity}
          className={`px-6 py-3 rounded-lg transition shadow-md font-medium flex items-center ${
            isSubmitting || totalSeatSum !== formData.capacity
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Create Event
            </>
          )}
        </button>
      </div>
    </div>
  );
};
