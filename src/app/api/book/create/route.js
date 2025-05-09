import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import Ticket from "@/model/Seat.model";
import User from "@/model/User.model";
import Event from "@/model/Event.model";
import { connectDB } from "@/dbConnect/index";
import { Server } from "socket.io";
import Venue from "@/model/Venue.model";
/*algo
connectdb
authcheck
if complete start transaction
take event details
check event
check event capacity
update ticket sold
limit ticket
 dublicate ticket for member
 member auth
 exist ticket check
 generate ticket
 save ticket
 user ticket update*/
export async function POST(request) {
  try {
    // Connect to database
    const connection = await connectDB();
    //login check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    //parse request body
    const body = await request.json();
    const { eventId, seats, totalPrice } = body;
    if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "invalid request. EventId and Seats are required.",
        },
        { status: 400 }
      );
    }
    //get userId from session
    const userId = session.user.id;
    //check event exist
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }
    //check venue Layout
    const venueLayout = await Venue.findOne({ eventId });
    if (!venueLayout) {
      return NextResponse.json(
        {
          success: false,
          message: "Venue layout not found for this event",
        },
        { status: 404 }
      );
    }
    // 4. Create a booking transaction
    const booking = new TicketBooking({
      eventId,
      userId,
      seats: seats.map((seat) => ({
        row: seat.row,
        col: seat.col,
        categoryId: seat.categoryId,
        subcategoryId: seat.subcategoryId,
        price: seat.price,
      })),
      totalPrice: totalPrice,
      status: "pending",
    });

    await booking.save();

    // 5. Update seat status to reserved in venue layout

    await venueLayout.save();

    // 6. Emit socket event to notify other users
    // This would typically be handled by a worker process or queue
    // but for simplicity, we'll emit directly here
    // Note: In production, you'd want to use a message queue for this
    try {
      const { Server } = await import("socket.io");
      const io = global.socketIo;

      if (io) {
        io.to(`event-${eventId}`).emit("seats-reserved", {
          seats: seats.map((seat) => ({ row: seat.row, col: seat.col })),
          userId,
          status: VenueLayout.status.RESERVED,
          timestamp: Date.now(),
        });
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
      // Don't fail the booking if socket fails
    }

    // 7. Return successful response with booking ID
    return NextResponse.json({
      success: true,
      message: "Seats reserved successfully",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      expiresAt: booking.expiresAt,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

//     const mongooseSession = await connection.startSession();
//     //transaction start
//     await mongooseSession.startTransaction();

//     try {
//       const { eventId, tickets } = await request.json();
//       const userId = session.user.id;

//       // Validation for event& tickets
//       if (!eventId || !tickets?.length) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json(
//           { error: "Invalid request body" },
//           { status: 400 }
//         );
//       }

//       // event exists check
//       const event = await Event.findById(eventId).session(mongooseSession);
//       if (!event) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json({ error: "Event not found" }, { status: 404 });
//       }
//       // Check event capacity
//       if (event.ticketsSold + tickets.length > event.capacity) {
//         await session.abortTransaction();
//         return NextResponse.json(
//           { error: "Not enough tickets available" },
//           { status: 400 }
//         );
//       }

//       // Update tickets sold after successful booking
//       event.ticketsSold += tickets.length;
//       await event.save({ session: mongooseSession });
//       // Get user with members
//       const user = await User.findById(userId)
//         .populate("members")
//         .session(mongooseSession);

//       if (!user) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json({ error: "User not found" }, { status: 404 });
//       }

//       // Existing tickets
//       const existingTickets = await Ticket.find({
//         eventId,
//         _id: { $in: user.tickets },
//       }).session(mongooseSession);

//       // limit ticket number
//       const memberTicketRequests = tickets.filter(
//         (t) => t.bookedFor === "Member"
//       );
//       const requestedMemberIds = memberTicketRequests.map((t) => t.memberId);

//       if (requestedMemberIds.length > user.members.length) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json(
//           { error: "Cannot book more tickets than your number of members" },
//           { status: 400 }
//         );
//       }

//       // Check for duplicate members in request
//       if (new Set(requestedMemberIds).size !== requestedMemberIds.length) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json(
//           { error: "Duplicate members in request" },
//           { status: 400 }
//         );
//       }

//       // Validate member ownership
//       const userMemberIds = user.members.map((m) => m._id.toString());
//       const invalidMembers = requestedMemberIds.filter(
//         (id) => !userMemberIds.includes(id)
//       );
//       if (invalidMembers.length > 0) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json(
//           { error: "Invalid member IDs detected" },
//           { status: 400 }
//         );
//       }

//       // Check existing bookings
//       const existingMemberBookings = existingTickets
//         .filter((t) => t.BookedFor === "Member")
//         .flatMap((t) => t.members.map((m) => m.toString()));

//       const duplicateBookings = requestedMemberIds.filter((id) =>
//         existingMemberBookings.includes(id)
//       );

//       if (duplicateBookings.length > 0) {
//         await mongooseSession.abortTransaction();
//         return NextResponse.json(
//           { error: "Some members already have tickets" },
//           { status: 400 }
//         );
//       }

//       // Generate tickets
//       const newTickets = await Promise.all(
//         tickets.map(async (ticketReq) => {
//           const ticketNumber = uuidv4();
//           const qrCode = await QRCode.toDataURL(
//             JSON.stringify({
//               ticketNumber,
//               eventId,
//               userId,
//             })
//           );

//           return new Ticket({
//             eventId,
//             ticketNumber,
//             BookedFor: ticketReq.bookedFor,
//             members:
//               ticketReq.bookedFor === "Member" ? [ticketReq.memberId] : [],
//             qrCode,
//             status: "Active",
//           });
//         })
//       );

//       // Save all tickets
//       const savedTickets = await Ticket.insertMany(newTickets, {
//         session: mongooseSession,
//       });

//       // Update user's tickets
//       user.tickets.push(...savedTickets.map((t) => t._id));
//       await user.save({ session: mongooseSession });

//       await mongooseSession.commitTransaction();

//       return NextResponse.json(
//         {
//           success: true,
//           tickets: savedTickets.map((ticket) => ({
//             id: ticket._id,
//             ticketNumber: ticket.ticketNumber,
//             type: ticket.BookedFor,
//             qrCode: ticket.qrCode,
//             status: ticket.status,
//           })),
//         },
//         { status: 201 }
//       );
//     } catch (error) {
//       await mongooseSession.abortTransaction();
//       console.error("Booking error:", error);
//       return NextResponse.json(
//         { error: "Internal server error" },
//         { status: 500 }
//       );
//     } finally {
//       await mongooseSession.endSession();
//     }
//   } catch (error) {
//     console.error("Database connection error:", error);
//     return NextResponse.json(
//       { error: "Database connection failed" },
//       { status: 500 }
//     );
//   }
// }
