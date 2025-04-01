"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateEventform = ({ isOrganizer }) => {
  //routing to page.js
  const router = useRouter();
  //form details
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
  //for add realtime seats available
  useEffect(() => {
    const sum = formData.categories.reduce(
      (acc, category) => acc + (category.totalSeats || 0),
      0
    );
    setTotalSeatSum(sum);
  }, [formData.categories]);
  //category changes
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
  //new category add
  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { name: "", totalSeats: 0, subcategories: [] },
      ],
    });
  };
  //remove any category
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

  if (!isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-500 mb-4">Organizer access required</p>
          <button
            onClick={() => router.push("/LandingPage")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create New Event
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Movie">Movie</option>
                  <option value="Music Festival">Music Festival</option>
                  <option value="Conference">Conference</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <input
                type="string"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Location Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="address"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Seat Categories
              </h3>
              {formData.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) =>
                        handleCategoryChange(
                          categoryIndex,
                          "name",
                          e.target.value
                        )
                      }
                      required
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Total seats"
                      value={category.totalSeats}
                      onChange={(e) =>
                        handleCategoryChange(
                          categoryIndex,
                          "totalSeats",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      required
                      className="w-24 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryIndex)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="ml-4 space-y-2">
                    {category.subcategories &&
                      category.subcategories.map((sub, subIndex) => (
                        <div key={subIndex} className="flex gap-2 mb-2">
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
                            className="flex-1 p-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Seats"
                            value={sub.subSeats}
                            onChange={(e) =>
                              handleSubcategoryChange(
                                categoryIndex,
                                subIndex,
                                "subSeats",
                                parseInt(e.target.value)
                              )
                            }
                            min="0"
                            required
                            className="w-24 p-2 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeSubcategory(categoryIndex, subIndex)
                            }
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => addSubcategory(categoryIndex)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Add Subcategory
                    </button>
                    {category.subcategories &&
                      category.subcategories.length > 0 && (
                        <div className="text-sm mt-2">
                          Subcategory Total:{" "}
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
                              Exceeds category limit
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCategory}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Add Category
              </button>
            </div>

            {error && (
              <div className="text-red-500 p-2 rounded bg-red-100">{error}</div>
            )}
            {success && (
              <div className="text-green-500 p-2 rounded bg-green-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventform;
