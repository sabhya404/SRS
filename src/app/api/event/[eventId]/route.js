import { NextResponse } from "next/server";
import { connectDB } from "@/dbConnect/index";
import Event from "@/model/Event.model";
import User from "@/model/User.model";

export async function GET(request, { params }) {
  await connectDB();

  // Extract eventId from params directly
  // This is still supported in the current version
  const { eventId } = await params;

  try {
    const event = await Event.findById(eventId).populate("organizer").lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    event._id = event._id.toString();
    event.startDate = event.startDate.toISOString();
    event.endDate = event.endDate.toISOString();
    // Convert ObjectId to string
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
