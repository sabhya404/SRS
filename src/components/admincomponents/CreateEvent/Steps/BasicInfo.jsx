"use client";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Tag,
  Upload,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export const BasicInfoStep = ({ formData, setFormData, preview, nextStep }) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = (result) => {
    // Handle successful upload
    if (result.event === "success") {
      const { secure_url } = result.info;
      setFormData({ ...formData, coverImage: secure_url });
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold border-b pb-3">Basic Information</h3>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-2">
          Event Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Enter a catchy title for your event"
        />
      </div>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-2">
          Event Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-32"
          placeholder="Provide a detailed description of your event"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Event Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
          >
            <option value="Movie">Movie</option>
            <option value="Music Festival">Music Festival</option>
            <option value="Conference">Conference</option>
            <option value="Training">Training</option>
            <option value="Parade">Parade</option>
            <option value="Ceremony">Ceremony</option>
          </select>
        </div>
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Total Capacity
          </label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: parseInt(e.target.value || 0),
              })
            }
            min="1"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Maximum attendees"
          />
        </div>
      </div>

      <div>
        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ImageIcon className="w-4 h-4 mr-2" />
          Cover Image
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={handleImageUpload}
              options={{
                maxFiles: 1,
                resourceType: "image",
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => {
                    setUploadingImage(true);
                    open();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition flex items-center justify-center bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImage
                    ? "Uploading..."
                    : formData.coverImage
                      ? "Change Image"
                      : "Upload Image"}
                </button>
              )}
            </CldUploadWidget>
            {formData.coverImage && (
              <div className="mt-2 text-xs text-gray-500 truncate">
                {formData.coverImage}
              </div>
            )}
          </div>
          <div className="col-span-1 flex items-center justify-center">
            {formData.coverImage ? (
              <div className="h-16 w-full rounded-lg bg-gray-100 overflow-hidden">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                Preview
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium flex items-center"
        >
          Continue to Location <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};
