import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Event from "@/model/Event.model";
import User from "@/model/User.model";
import { connectDB } from "@/dbConnect/index";
/*algo
database connection
authentication check
organiser check
valid the request
check categories
field details
create event
save event
event status check 
error handling
*/
export async function POST(request) {
  try {
    // Database connection
    await connectDB();

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Organizer check
    const user = await User.findById(session.user.id);
    if (!user?.isOrganizer) {
      return NextResponse.json(
        { error: "Organizer privileges required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const eventData = await request.json();

    // check and valid categories
    if (
      !Array.isArray(eventData.categories) ||
      eventData.categories.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid categories" },
        { status: 400 }
      );
    }

    // field detail and validate
    const requiredFields = [
      "title",
      "description",
      "startDate",
      "endDate",
      "type",
      "location",
      "capacity",
    ];
    const missingFields = requiredFields.filter((field) => !eventData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Create new event with organizer reference
    const newEvent = new Event({
      ...eventData,
      organizer: user._id,
      status: "Draft", // Default status
    });

    // Save event
    const savedEvent = await newEvent.save();

    // event status check
    if (!user.organizerDetails || !user.organizerDetails.name) {
      if (eventData.organizerDetails) {
        user.organizerDetails = {
          ...eventData.organizerDetails,
          verificationStatus: "Pending",
        };
        await user.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event: savedEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(", ")}` },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Event with similar details already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
