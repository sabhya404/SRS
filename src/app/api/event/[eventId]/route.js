import { NextResponse } from "next/server";
import { connectDB } from "@/dbConnect/index";
// Import models with explicit variable names to ensure proper registration
import Event from "@/model/Event.model";
import User from "@/model/User.model";
// Also import Venue model since it's referenced in Event schema
import "@/model/Venue.model";

export async function GET(request, { params }) {
  try {
    // Always establish DB connection before using models
    await connectDB();

    // Access params directly (no destructuring)
    const eventId = params.eventId;

    const event = await Event.findById(eventId).populate("organizer").lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Convert ObjectIds to strings and format dates
    const formattedEvent = JSON.parse(JSON.stringify(event));

    // Convert primary ObjectId
    formattedEvent._id = event._id.toString();

    // Format dates
    if (event.startDate)
      formattedEvent.startDate = event.startDate.toISOString();
    if (event.endDate) formattedEvent.endDate = event.endDate.toISOString();
    if (event.createdAt)
      formattedEvent.createdAt = event.createdAt.toISOString();
    if (event.updatedAt)
      formattedEvent.updatedAt = event.updatedAt.toISOString();

    // Handle populated organizer if it exists
    if (formattedEvent.organizer && formattedEvent.organizer._id) {
      formattedEvent.organizer._id = formattedEvent.organizer._id.toString();
    }

    // Handle venue reference if populated
    if (formattedEvent.venue && formattedEvent.venue._id) {
      formattedEvent.venue._id = formattedEvent.venue._id.toString();
    }

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
