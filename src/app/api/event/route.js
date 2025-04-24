// File: app/api/event/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConnect/index";
import Event from "@/model/Event.model";
import User from "@/model/User.model";

export async function GET(request) {
  await connectDB();

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    // const status = searchParams.get("status") || "Published"; // Default to published events

    // Build query
    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (city && city !== "all") {
      query["location.city"] = city;
    }

    // Fetch events
    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ startDate: 1 }) // Sort by date ascending
      .lean();

    // Process the events to convert ObjectIds to strings and format dates
    const processedEvents = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      organizer: event.organizer
        ? {
            ...event.organizer,
            _id: event.organizer._id.toString(),
          }
        : null,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      categories: event.categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
        subcategories: category.subcategories.map((sub) => ({
          ...sub,
          _id: sub._id.toString(),
        })),
      })),
    }));

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// File: app/api/events/[eventId]/route.js
// This is already provided in your code sample, but I'm including it here for completeness
