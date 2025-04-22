"use client";
import { Users, Plus, X, Check } from "lucide-react";

// SeatingStep component for step-wise seating configuration in a form
export const SeatingStep = ({
  formData,
  totalSeatSum,
  handleCategoryChange,
  handleSubcategoryChange,
  addCategory,
  removeCategory,
  addSubcategory,
  removeSubcategory,
  prevStep,
  nextStep,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h3 className="text-xl font-semibold border-b pb-3 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Seating Categories
      </h3>

      {/* Capacity Overview */}
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

      {/* If no categories exist */}
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

      {/* Category List */}
      {formData.categories.map((category, categoryIndex) => {
        const subTotal =
          category.subcategories?.reduce(
            (sum, sub) => sum + (sub.subSeats || 0),
            0
          ) || 0;

        return (
          <div key={categoryIndex} className="bg-gray-50 p-4 rounded-lg mb-4">
            {/* Category Header */}
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

            {/* Category Inputs */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Category name (e.g. VIP, Standard)"
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryChange(categoryIndex, "name", e.target.value)
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
                      parseInt(e.target.value || "0")
                    )
                  }
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Subcategories */}
            <div className="ml-4 space-y-2 border-l-2 border-blue-200 pl-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Subcategories
              </h5>

              {(!category.subcategories ||
                category.subcategories.length === 0) && (
                <p className="text-sm text-gray-500 italic mb-2">
                  No subcategories added yet
                </p>
              )}

              {category.subcategories?.map((sub, subIndex) => (
                <div key={subIndex} className="flex gap-2 mb-2 items-center">
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
                          parseInt(e.target.value || "0")
                        )
                      }
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubcategory(categoryIndex, subIndex)}
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

              {/* Subcategory Summary */}
              {category.subcategories?.length > 0 && (
                <div
                  className={`text-sm mt-2 ${
                    subTotal > category.totalSeats
                      ? "text-red-500"
                      : subTotal === category.totalSeats
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  Subcategories Total: {subTotal}/{category.totalSeats}
                  {subTotal > category.totalSeats && (
                    <span className="text-red-500 ml-2">
                      ⚠️ Exceeds category limit
                    </span>
                  )}
                  {subTotal === category.totalSeats && (
                    <span className="text-green-600 ml-2 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> Perfect match
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Category Button */}
      {formData.categories.length > 0 && (
        <button
          type="button"
          onClick={addCategory}
          className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Another Category
        </button>
      )}

      {/* Navigation Buttons */}
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
};
