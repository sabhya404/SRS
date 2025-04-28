// event/[eventId]/eventDetail/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, MapPin, Calendar, Users, Tag } from "lucide-react";
import Image from "next/image";

export default function EventDetailPage({ params }) {
  const router = useRouter();
  // Get the event ID from the parent folder parameter
  const eventId = params?.eventId;

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdownFinished, setCountdownFinished] = useState(false);

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        // Make an API call to fetch event details using the ID
        const response = await fetch(`/api/event/${eventId}`);
        const data = await response.json();

        if (response.ok) {
          setEvent(data);
        } else {
          console.error("Failed to fetch event data");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Calculate time remaining for countdown timer
  useEffect(() => {
    if (event) {
      const timer = setInterval(() => {
        const now = new Date();
        const eventDate = new Date(event.startDate || event.date);
        const difference = eventDate - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setTimeRemaining({ days, hours, minutes, seconds });
        } else {
          clearInterval(timer);
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setCountdownFinished(true);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [event]);

  const handleBookTicket = () => {
    router.push(`/book-ticket?eventId=${eventId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading event details...</div>
      </div>
    );
  }

  // Show error if event not found
  if (!event && !loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl mb-4">Event not found</div>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg"
        >
          Return to Events
        </button>
      </div>
    );
  }

  // Format the countdown display
  const CountdownDisplay = () => {
    if (countdownFinished) {
      return (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
          <p className="font-bold">Event has started!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-2 w-full">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">
            {timeRemaining.days}
          </div>
          <div className="text-xs text-gray-600">Days</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">
            {timeRemaining.hours}
          </div>
          <div className="text-xs text-gray-600">Hours</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">
            {timeRemaining.minutes}
          </div>
          <div className="text-xs text-gray-600">Mins</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">
            {timeRemaining.seconds}
          </div>
          <div className="text-xs text-gray-600">Secs</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {event && (
        <>
          {/* Event Banner */}
          <motion.div
            className="w-full h-64 md:h-96 bg-gray-200 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full h-full">
              <Image
                src={
                  event.bannerImage ||
                  event.coverImage ||
                  "/api/placeholder/1200/400"
                }
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <motion.div
                className="text-center text-white p-6 rounded-lg bg-black bg-opacity-50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Tag size={18} />
                  <span>{event.eventType || event.type}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Event Details */}
              <div className="lg:col-span-2">
                <motion.div
                  className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                      Event Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-start space-x-3">
                        <Calendar
                          className="text-blue-500 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <div>
                          <h3 className="font-medium text-gray-700">Date</h3>
                          <p className="text-gray-600">
                            {new Date(
                              event.startDate || event.date
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock
                          className="text-blue-500 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <div>
                          <h3 className="font-medium text-gray-700">Time</h3>
                          <p className="text-gray-600">
                            {event.time ||
                              new Date(event.startDate).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin
                          className="text-blue-500 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Location
                          </h3>
                          {event.isOnline ? (
                            <p className="text-gray-600">Online Event</p>
                          ) : (
                            <>
                              <p className="text-gray-600">
                                {event.location?.name ||
                                  event.location?.address}
                              </p>
                              <p className="text-gray-500 text-sm">
                                {event.location?.address &&
                                !event.location?.name
                                  ? `${event.location.city}, ${event.location.country}`
                                  : event.location?.address}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Users
                          className="text-blue-500 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Capacity
                          </h3>
                          <p className="text-gray-600">
                            {event.availableSeats ||
                              event.capacity - event.ticketsSold}{" "}
                            available / {event.totalSeats || event.capacity}{" "}
                            total
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  event.availableSeats
                                    ? (event.availableSeats /
                                        event.totalSeats) *
                                      100
                                    : ((event.capacity - event.ticketsSold) /
                                        event.capacity) *
                                      100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-800">
                      About This Event
                    </h3>
                    <div className="prose max-w-none text-gray-600">
                      {event.description.split("\n\n").map((paragraph, idx) => (
                        <p key={idx} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Map Section */}
                {!event.isOnline && (
                  <motion.div
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Location
                      </h2>
                      <div className="h-80 bg-gray-200 rounded-lg overflow-hidden relative">
                        {/* Map placeholder */}
                      </div>
                      <p className="mt-3 text-gray-600">
                        <MapPin className="inline-block mr-1" size={16} />
                        {event.location?.name || ""}{" "}
                        {event.location?.address
                          ? `, ${event.location.address}`
                          : ""}
                        {event.location?.city ? `, ${event.location.city}` : ""}
                        {event.location?.country
                          ? `, ${event.location.country}`
                          : ""}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Booking Info */}
              <div className="lg:col-span-1">
                <motion.div
                  className="bg-white rounded-xl shadow-md overflow-hidden mb-8 sticky top-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                      Book Your Ticket
                    </h2>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {countdownFinished
                          ? "Event Started!"
                          : "Event Starts In:"}
                      </h3>
                      <CountdownDisplay />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Ticket Price:</span>
                        <span className="font-bold text-gray-800">
                          ${event.price || "Free"}
                        </span>
                      </div>
                      {event.earlyBirdDiscount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Early Bird Discount:
                          </span>
                          <span className="font-bold text-green-600">
                            -${event.earlyBirdDiscount}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleBookTicket}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg"
                      disabled={countdownFinished}
                    >
                      {countdownFinished ? "Event In Progress" : "Book Now"}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
