"use client";
import { MapPin } from "lucide-react";

export const LocationStep = ({ formData, setFormData, prevStep, nextStep }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold border-b pb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        Location Details
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            placeholder="Building name, street address"
            value={formData.location.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  address: e.target.value,
                },
              })
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              placeholder="City"
              value={formData.location.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    city: e.target.value,
                  },
                })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              placeholder="Country"
              value={formData.location.country}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    country: e.target.value,
                  },
                })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <img
          src="/api/placeholder/800/240"
          alt="Map placeholder"
          className="w-full h-40 object-cover"
        />
      </div>

      <div className="pt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition shadow-md font-medium flex items-center"
        >
          <span className="mr-2">←</span> Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium flex items-center"
        >
          Continue to Seating <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};
