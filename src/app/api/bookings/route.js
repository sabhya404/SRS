import { NextResponse } from "next/server";
import { connectDB } from "@/dbConnect/index";
import SeatBooking from "@/model/Seat.model";
import Venue from "@/model/Venue.model";
import Event from "@/model/Event.model";
import User from "@/model/User.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Update the path to your auth options

export async function POST(request) {
  try {
    await connectDB();
    
    // Get session data (for authenticated users)
    const session = await getServerSession(authOptions);
    
    // Get booking data from request
    const bookingData = await request.json();
    
    // Validate essential data
    if (!bookingData.eventId || !bookingData.seats || bookingData.seats.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required booking information" },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated, otherwise use guest info
    let userId;
    
    if (session?.user?.id) {
      // Authenticated user
      userId = session.user.id;
    } else if (bookingData.userId) {
      // User ID provided in request (e.g., for guest checkout with existing account)
      userId = bookingData.userId;
    } else {
      // For guest checkout without account, try to find user by email
      if (bookingData.customer?.email) {
        const existingUser = await User.findOne({ email: bookingData.customer.email });
        
        if (existingUser) {
          userId = existingUser._id;
        } else {
          // This is a guest checkout without an account
          return NextResponse.json(
            { success: false, message: "User authentication required for booking" },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: "User authentication required for booking" },
          { status: 401 }
        );
      }
    }
    
    // Verify event exists
    const event = await Event.findById(bookingData.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }
    
    // Verify venue and check seat availability
    const venue = await Venue.findOne({ eventId: bookingData.eventId });
    if (!venue) {
      return NextResponse.json(
        { success: false, message: "Venue not found for this event" },
        { status: 404 }
      );
    }
    
    // Check if any of the seats are already booked
    const bookedSeats = [];
    for (const seat of bookingData.seats) {
      if (venue.seats[seat.row][seat.col].status === "booked") {
        bookedSeats.push(`Row ${seat.row + 1}, Seat ${seat.col + 1}`);
      }
    }
    
    if (bookedSeats.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Some seats are no longer available", 
          bookedSeats 
        },
        { status: 409 }
      );
    }
    
    // Format seats for database
    const formattedSeats = bookingData.seats.map(seat => ({
      row: seat.row,
      col: seat.col,
      categoryId: seat.categoryId,
      subcategoryId: seat.subcategoryId || null,
      price: seat.price
    }));
    
    // Calculate total price (re-calculate on server to prevent tampering)
    const totalPrice = formattedSeats.reduce((sum, seat) => sum + seat.price, 0);
    
    // Create the booking
    const booking = new SeatBooking({
      eventId: new mongoose.Types.ObjectId(bookingData.eventId),
      userId: new mongoose.Types.ObjectId(userId),
      seats: formattedSeats,
      totalPrice,
      status: "confirmed", // Set as confirmed since payment is simulated
      paymentStatus: "paid", // Set as paid since payment is simulated
      paymentId: `sim_${Date.now()}` // Simulated payment ID
    });
    
    // Save the booking
    await booking.save();
    
    // Update the venue to mark seats as booked
    for (const seat of bookingData.seats) {
      venue.seats[seat.row][seat.col].status = "booked";
    }
    await venue.save();
    
    // Update event ticket count
    event.ticketsSold += bookingData.seats.length;
    await event.save();
    
    // If user model has tickets array, add this booking to it
    const user = await User.findById(userId);
    if (user && user.tickets) {
      user.tickets.push(booking._id);
      await user.save();
    }
    
    // Return the booking information with booking number
    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        seats: booking.seats.length,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt
      }
    });
    
  } catch (error) {
    console.error("Booking error:", error);
    
    let statusCode = 500;
    let errorMessage = "Failed to process booking";
    
    // Handle specific errors
    if (error.code === 11000) {
      statusCode = 409;
      errorMessage = "Seat already booked by another user";
    } else if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: statusCode }
    );
  }
}

// Add a GET endpoint to retrieve a booking by ID or booking number
export async function GET(request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const bookingNumber = url.searchParams.get("bookingNumber");
    
    if (!id && !bookingNumber) {
      return NextResponse.json(
        { success: false, message: "Booking ID or booking number is required" },
        { status: 400 }
      );
    }
    
    // Get session data for user authorization
    const session = await getServerSession(authOptions);
    
    let query = {};
    if (id) {
      query._id = id;
    } else {
      query.bookingNumber = bookingNumber;
    }
    
    // Find booking
    const booking = await SeatBooking.findOne(query)
      .populate({
        path: 'eventId',
        select: 'title startDate endDate location coverImage organizer'
      })
      .populate({
        path: 'userId',
        select: 'email username'
      });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }
    
    // Check authorization - only allow access to the user who made the booking or admin
    if (session?.user?.id && booking.userId._id.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to booking" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking
    });
    
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}