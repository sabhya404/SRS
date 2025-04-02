"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Tag,
  Plus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

const CreateEventForm = ({ isOrganizer }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "Movie",
    location: {
      address: "",
      city: "",
      country: "",
    },
    capacity: 0,
    categories: [],
    coverImage: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalSeatSum, setTotalSeatSum] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const sum = formData.categories.reduce(
      (acc, category) => acc + (category.totalSeats || 0),
      0
    );
    setTotalSeatSum(sum);
  }, [formData.categories]);

  useEffect(() => {
    if (formData.coverImage) {
      setPreview(formData.coverImage);
    }
  }, [formData.coverImage]);

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleSubcategoryChange = (categoryIndex, subIndex, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].subcategories[subIndex][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { name: "", totalSeats: 0, subcategories: [] },
      ],
    });
  };

  const removeCategory = (index) => {
    const updatedCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const addSubcategory = (categoryIndex) => {
    const updatedCategories = [...formData.categories];
    if (!updatedCategories[categoryIndex].subcategories) {
      updatedCategories[categoryIndex].subcategories = [];
    }
    updatedCategories[categoryIndex].subcategories.push({
      subName: "",
      subSeats: 0,
    });
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeSubcategory = (categoryIndex, subIndex) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].subcategories = updatedCategories[
      categoryIndex
    ].subcategories.filter((_, i) => i !== subIndex);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (totalSeatSum !== formData.capacity) {
      setError(
        `Total seats in categories (${totalSeatSum}) must equal event capacity (${formData.capacity})`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      for (const category of formData.categories) {
        if (!category.subcategories || category.subcategories.length === 0) {
          setError(
            `Category "${category.name}" must have at least one subcategory`
          );
          setIsSubmitting(false);
          return;
        }

        const subSum = category.subcategories.reduce(
          (acc, sub) => acc + (sub.subSeats || 0),
          0
        );

        if (subSum > category.totalSeats) {
          setError(
            `Subcategories in "${category.name}" exceed total seats (${subSum} > ${category.totalSeats})`
          );
          setIsSubmitting(false);
          return;
        }
      }

      const response = await axios.post("/api/event/create", formData);
      if (response.data.success) {
        setSuccess("Event created successfully!");
        router.refresh();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to create Event";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  if (!isOrganizer) {
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
  }

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-3">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter a catchy title for your event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2  items-center">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
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
                <label className="block text-sm font-medium text-gray-700 mb-2  items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
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
                <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
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
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Cover Image URL
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <input
                    type="string"
                    value={formData.coverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImage: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter URL for event cover image"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {preview ? (
                    <div className="h-16 w-full rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setPreview("")}
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

      case 2:
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

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Seating Categories
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-medium">Total Capacity:</span>{" "}
                {formData.capacity}
              </div>
              <div>
                <span className="font-medium">Allocated Seats:</span>{" "}
                <span
                  className={
                    totalSeatSum !== formData.capacity
                      ? "text-red-500 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {totalSeatSum}
                </span>
              </div>
            </div>

            {formData.categories.length === 0 && (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">No seating categories yet</p>
                <button
                  type="button"
                  onClick={addCategory}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Category
                </button>
              </div>
            )}

            {formData.categories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="bg-gray-50 p-4 rounded-lg mb-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Category #{categoryIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCategory(categoryIndex)}
                    className="text-red-500 hover:text-red-700 transition flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Category name (e.g. VIP, Standard)"
                      value={category.name}
                      onChange={(e) =>
                        handleCategoryChange(
                          categoryIndex,
                          "name",
                          e.target.value
                        )
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      placeholder="Seats"
                      value={category.totalSeats}
                      onChange={(e) =>
                        handleCategoryChange(
                          categoryIndex,
                          "totalSeats",
                          parseInt(e.target.value || 0)
                        )
                      }
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="ml-4 space-y-2 border-l-2 border-blue-200 pl-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Subcategories
                  </h5>

                  {category.subcategories &&
                    category.subcategories.length === 0 && (
                      <div className="text-sm text-gray-500 italic mb-2">
                        No subcategories added yet
                      </div>
                    )}

                  {category.subcategories &&
                    category.subcategories.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex gap-2 mb-2 items-center"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Subcategory name"
                            value={sub.subName}
                            onChange={(e) =>
                              handleSubcategoryChange(
                                categoryIndex,
                                subIndex,
                                "subName",
                                e.target.value
                              )
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Seats"
                            value={sub.subSeats}
                            onChange={(e) =>
                              handleSubcategoryChange(
                                categoryIndex,
                                subIndex,
                                "subSeats",
                                parseInt(e.target.value || 0)
                              )
                            }
                            min="0"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeSubcategory(categoryIndex, subIndex)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  <button
                    type="button"
                    onClick={() => addSubcategory(categoryIndex)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition text-sm flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Subcategory
                  </button>

                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div
                        className={`text-sm mt-2 ${
                          category.subcategories.reduce(
                            (sum, sub) => sum + (sub.subSeats || 0),
                            0
                          ) > category.totalSeats
                            ? "text-red-500"
                            : category.subcategories.reduce(
                                  (sum, sub) => sum + (sub.subSeats || 0),
                                  0
                                ) === category.totalSeats
                              ? "text-green-600"
                              : "text-gray-600"
                        }`}
                      >
                        Subcategories Total:{" "}
                        {category.subcategories.reduce(
                          (sum, sub) => sum + (sub.subSeats || 0),
                          0
                        )}
                        /{category.totalSeats}
                        {category.subcategories.reduce(
                          (sum, sub) => sum + (sub.subSeats || 0),
                          0
                        ) > category.totalSeats && (
                          <span className="text-red-500 ml-2">
                            ⚠️ Exceeds category limit
                          </span>
                        )}
                        {category.subcategories.reduce(
                          (sum, sub) => sum + (sub.subSeats || 0),
                          0
                        ) === category.totalSeats && (
                          <span className="text-green-600 ml-2 flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Perfect match
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {formData.categories.length > 0 && (
              <button
                type="button"
                onClick={addCategory}
                className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Another Category
              </button>
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
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium flex items-center"
              >
                Review Event <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-3">
              Review & Submit
            </h3>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">
                    Event Information
                  </h4>
                  <div className="mb-4">
                    <div className="text-xl font-bold text-gray-900">
                      {formData.title || "No title provided"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formData.type}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700 mb-1">
                    Date & Time
                  </h4>
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {formData.startDate
                        ? new Date(formData.startDate).toLocaleString()
                        : "Not set"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      {formData.endDate
                        ? new Date(formData.endDate).toLocaleString()
                        : "Not set"}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700 mb-1">Location</h4>
                  <div className="mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-1" />
                      <div>
                        {formData.location.address}
                        <br />
                        {formData.location.city}, {formData.location.country}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="rounded-lg overflow-hidden mb-4 h-40 bg-gray-200">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Event cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <h4 className="font-medium text-gray-700 mb-1">Capacity</h4>
                  <div className="mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{formData.capacity}</span>
                      <span className="mx-2">•</span>
                      <span
                        className={
                          totalSeatSum !== formData.capacity
                            ? "text-red-500"
                            : "text-green-600"
                        }
                      >
                        {totalSeatSum === formData.capacity ? (
                          <span className="flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Categories match
                          </span>
                        ) : (
                          <span>Categories don't match</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700 mb-1">Categories</h4>
                  <div className="mb-4">
                    {formData.categories.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">
                        No categories defined
                      </div>
                    ) : (
                      <div className="text-sm">
                        {formData.categories.map((cat, idx) => (
                          <div key={idx} className="mb-1">
                            <span className="font-medium">{cat.name}</span>:{" "}
                            {cat.totalSeats} seats
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700">
                  {formData.description || "No description provided"}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
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
                  <>Processing...</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <p className="text-blue-100">
            Fill in the details to create your event
          </p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center ${
                    step < activeStep
                      ? "text-green-600"
                      : step === activeStep
                        ? "text-blue-600"
                        : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step < activeStep
                        ? "bg-green-100 text-green-600 border-2 border-green-600"
                        : step === activeStep
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                    }`}
                  >
                    {step < activeStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className="text-sm font-medium">
                    {step === 1 && "Basics"}
                    {step === 2 && "Location"}
                    {step === 3 && "Seating"}
                    {step === 4 && "Review"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>{renderStep()}</form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;
