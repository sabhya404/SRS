import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Tag, Globe } from "lucide-react";
import { format, formatDistance } from "date-fns";

export default function EventCard({ event }) {
  // Format dates for display
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const formattedStartDate = format(startDate, "EEE, MMM d, yyyy");
  const formattedStartTime = format(startDate, "h:mm a");
  const timeUntilEvent = formatDistance(startDate, new Date(), {
    addSuffix: true,
  });

  // Calculate total available seats
  const availableSeats = event.capacity - event.ticketsSold;
  const availabilityPercentage = Math.round(
    (availableSeats / event.capacity) * 100
  );

  // Determine availability status and color
  let availabilityStatus = "Available";
  let statusColor = "bg-green-500";

  if (availabilityPercentage <= 10) {
    availabilityStatus = "Almost Sold Out";
    statusColor = "bg-red-500";
  } else if (availabilityPercentage <= 30) {
    availabilityStatus = "Selling Fast";
    statusColor = "bg-yellow-500";
  }

  // Get the first category with seats for display
  const primaryCategory =
    event.categories && event.categories.length > 0
      ? event.categories[0]
      : null;

  // Handle invalid or missing cover image URL
  const imageUrl = event.coverImage
    ? new URL(event.coverImage, window.location.href).href
    : "/api/placeholder/600/400"; // Fallback to a placeholder if the image is invalid

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl} // Use the resolved image URL
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-0 right-0 bg-indigo-600 text-white py-1 px-3 m-2 rounded-full text-sm font-medium">
          {event.type}
        </div>

        {event.status !== "Published" && (
          <div className="absolute top-0 left-0 bg-gray-800 text-white py-1 px-3 m-2 rounded-full text-xs font-medium">
            {event.status}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent py-3 px-4">
          <h3 className="text-xl font-bold text-white truncate">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center text-gray-600 mb-3">
          <Calendar size={16} className="mr-2 text-indigo-600" />
          <span>{formattedStartDate}</span>
          <span className="mx-2 text-gray-400">•</span>
          <Clock size={16} className="mr-2 text-indigo-600" />
          <span>{formattedStartTime}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-2 text-indigo-600" />
          <span className="truncate">
            {event.isOnline
              ? "Online Event"
              : `${event.location.address}, ${event.location.city}, ${event.location.country}`}
          </span>
          {event.isOnline && <Globe size={16} className="ml-2 text-blue-500" />}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        {primaryCategory && (
          <div className="flex items-center mb-3">
            <Tag size={16} className="mr-2 text-indigo-600" />
            <span className="text-gray-700 font-medium">
              {primaryCategory.name}
            </span>
            {primaryCategory.subcategories &&
              primaryCategory.subcategories.length > 0 && (
                <span className="ml-2 text-gray-500 text-sm">
                  ({primaryCategory.subcategories.length} ticket types)
                </span>
              )}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-2" />
            <span>
              {event.ticketsSold} / {event.capacity} booked
            </span>
          </div>
          <span
            className={`text-sm text-white font-medium px-2 py-1 rounded-full ${statusColor}`}
          >
            {availabilityStatus}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{
              width: `${Math.min(100, (event.ticketsSold / event.capacity) * 100)}%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-indigo-600 font-medium">
            {timeUntilEvent}
          </span>

          <Link href={`/event/${event._id}/eventDetail`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
