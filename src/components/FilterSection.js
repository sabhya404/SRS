"use client";

import { motion } from "framer-motion";
import { Filter, Calendar, MapPin } from "lucide-react";

export default function FilterSection({
  filters,
  setFilters,
  eventTypes,
  eventCities,
}) {
  const dateRanges = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-700">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 text-indigo-600 mr-2" />
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Event Type
            </label>
          </div>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700"
            >
              Date Range
            </label>
          </div>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 text-indigo-600 mr-2" />
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
          </div>
          <select
            id="city"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {eventCities.map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "All Cities" : city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}
