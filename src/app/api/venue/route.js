// app/api/venues/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Venue from "@/models/Venue.model";
import Event from "@/models/Event.model";
import { connectDB } from "@/dbConnect/index";

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectId if needed
    const eventId =
      typeof data.eventId === "string"
        ? new mongoose.Types.ObjectId(data.eventId)
        : data.eventId;

    // Fetch the related event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if venue already exists for this event
    let venue = await Venue.findByEventId(eventId);

    if (venue) {
      // Update existing venue
      venue.shape = data.shape || venue.shape;
      venue.dimensions = data.dimensions || venue.dimensions;
      venue.seats = data.seats || venue.seats;
      venue.categoryColors = data.categoryColors || venue.categoryColors;
      venue.subcategoryColors =
        data.subcategoryColors || venue.subcategoryColors;
      venue.sections = data.sections || venue.sections;
      venue.isLayoutComplete =
        data.isLayoutComplete !== undefined
          ? data.isLayoutComplete
          : venue.isLayoutComplete;

      await venue.save();
    } else {
      // Create new venue
      venue = new Venue({
        eventId,
        shape: data.shape || "rectangle",
        dimensions: data.dimensions,
        seats: data.seats,
        categoryColors: data.categoryColors,
        subcategoryColors: data.subcategoryColors,
        sections: data.sections || [],
        isLayoutComplete: data.isLayoutComplete || false,
      });

      await venue.save();
    }

    // Update the event's hasVenueLayout flag
    event.hasVenueLayout = true;
    await event.save();

    return NextResponse.json({
      success: true,
      message: "Venue layout saved successfully",
      venue: {
        _id: venue._id,
        eventId: venue.eventId,
        shape: venue.shape,
        dimensions: venue.dimensions,
        isLayoutComplete: venue.isLayoutComplete,
      },
    });
  } catch (error) {
    console.error("Error saving venue:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save venue" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const venue = await Venue.findByEventId(
      new mongoose.Types.ObjectId(eventId)
    );

    if (!venue) {
      return NextResponse.json(
        { success: false, message: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

/**
 * Delete a venue
 * DELETE /api/venues?eventId={id}
 */
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const eventId = searchParams.get("eventId");

//     if (!eventId) {
//       return NextResponse.json(
//         { success: false, message: "Event ID is required" },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Find and delete the venue
//     const venue = await Venue.findOneAndDelete({
//       eventId: new mongoose.Types.ObjectId(eventId),
//     });

//     if (!venue) {
//       return NextResponse.json(
//         { success: false, message: "Venue not found" },
//         { status: 404 }
//       );
//     }

//     // Update the event
//     await Event.findByIdAndUpdate(eventId, { hasVenueLayout: false });

//     return NextResponse.json({
//       success: true,
//       message: "Venue deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting venue:", error);
//     return NextResponse.json(
//       { success: false, message: error.message || "Failed to delete venue" },
//       { status: 500 }
//     );
//   }
// }
