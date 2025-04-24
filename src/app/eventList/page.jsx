// File: app/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";
import SearchBar from "@/components/SearchBar";
import FilterSection from "@/components/FilterSection";
import { format } from "date-fns";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    city: "all",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/event");

        setEvents(response.data);
        setFilteredEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search term and filters
    let results = events;

    if (searchTerm) {
      results = results.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type !== "all") {
      results = results.filter((event) => event.type === filters.type);
    }

    if (filters.city !== "all") {
      results = results.filter((event) => event.location.city === filters.city);
    }

    if (filters.dateRange !== "all") {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      results = results.filter((event) => {
        const eventDate = new Date(event.startDate);
        if (filters.dateRange === "today") {
          return eventDate.toDateString() === today.toDateString();
        } else if (filters.dateRange === "week") {
          return eventDate >= today && eventDate <= nextWeek;
        } else if (filters.dateRange === "month") {
          return eventDate >= today && eventDate <= nextMonth;
        }
        return true;
      });
    }

    setFilteredEvents(results);
  }, [searchTerm, filters, events]);

  // Generate unique lists for filters
  const eventTypes = ["all", ...new Set(events.map((event) => event.type))];
  const eventCities = [
    "all",
    ...new Set(events.map((event) => event.location.city)),
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 m-5">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the best events happening in your city and beyond. Book your
            seats now!
          </p>
        </motion.div>

        <div className="mb-8">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <div className="mb-8">
          <FilterSection
            filters={filters}
            setFilters={setFilters}
            eventTypes={eventTypes}
            eventCities={eventCities}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">
              No events found
            </h2>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
