// app/api/bookings/confirm/route.js
import { NextResponse } from "next/server";
import connectDB from "@/dbConnect/index";
import SeatBooking from "@/model/Seat.model";
import Venue from "@/model/Venue.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingId, paymentId } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // 1. Find the booking
    const booking = await SeatBooking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    // 2. Check if booking belongs to the current user
    if (booking.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: This booking does not belong to you",
        },
        { status: 403 }
      );
    }

    // 3. Check if booking is not already confirmed or cancelled
    if (booking.status === "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking is already confirmed",
        },
        { status: 409 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot confirm a cancelled booking",
        },
        { status: 409 }
      );
    }

    // 4. Check if booking has expired
    if (booking.expiresAt && new Date(booking.expiresAt) < new Date()) {
      // Mark booking as cancelled
      booking.status = "cancelled";
      await booking.save();

      return NextResponse.json(
        {
          success: false,
          message: "Booking has expired",
        },
        { status: 410 }
      );
    }

    // 5. Get the venue layout
    const venueLayout = await Venue.findOne({ eventId: booking.eventId });
    if (!venueLayout) {
      return NextResponse.json(
        {
          success: false,
          message: "Venue layout not found",
        },
        { status: 404 }
      );
    }

    // 6. Update booking status
    booking.status = "confirmed";
    booking.paymentId = paymentId || null;
    booking.paymentStatus = paymentId ? "paid" : "pending";
    booking.expiresAt = null; // Remove expiration

    await booking.save();

    // 7. Update seat status to booked in venue layout
    for (const seat of booking.seats) {
      venueLayout.updateSeatStatus(
        seat.row,
        seat.col,
        VenueLayout.status.BOOKED,
        userId
      );
    }

    await venueLayout.save();

    // 8. Emit socket event to notify other users
    try {
      const io = global.socketIo;

      if (io) {
        io.to(`event-${booking.eventId}`).emit("seats-booked", {
          seats: booking.seats.map((seat) => ({
            row: seat.row,
            col: seat.col,
          })),
          userId,
          status: Venue.status.BOOKED,
          timestamp: Date.now(),
        });
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
      // Don't fail the booking if socket fails
    }

    // 9. Return successful response
    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while confirming booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
