import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import Ticket from "@/model/Ticket.model";
import User from "@/model/User.model";
import Event from "@/model/Event.model";
import { connectDB } from "@/dbConnect/index";
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

    const mongooseSession = await connection.startSession();
    //transaction start
    await mongooseSession.startTransaction();

    try {
      const { eventId, tickets } = await request.json();
      const userId = session.user.id;

      // Validation for event& tickets
      if (!eventId || !tickets?.length) {
        await mongooseSession.abortTransaction();
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      // event exists check
      const event = await Event.findById(eventId).session(mongooseSession);
      if (!event) {
        await mongooseSession.abortTransaction();
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      // Check event capacity
      if (event.ticketsSold + tickets.length > event.capacity) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Not enough tickets available" },
          { status: 400 }
        );
      }

      // Update tickets sold after successful booking
      event.ticketsSold += tickets.length;
      await event.save({ session: mongooseSession });
      // Get user with members
      const user = await User.findById(userId)
        .populate("members")
        .session(mongooseSession);

      if (!user) {
        await mongooseSession.abortTransaction();
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Existing tickets
      const existingTickets = await Ticket.find({
        eventId,
        _id: { $in: user.tickets },
      }).session(mongooseSession);

      // limit ticket number
      const memberTicketRequests = tickets.filter(
        (t) => t.bookedFor === "Member"
      );
      const requestedMemberIds = memberTicketRequests.map((t) => t.memberId);

      if (requestedMemberIds.length > user.members.length) {
        await mongooseSession.abortTransaction();
        return NextResponse.json(
          { error: "Cannot book more tickets than your number of members" },
          { status: 400 }
        );
      }

      // Check for duplicate members in request
      if (new Set(requestedMemberIds).size !== requestedMemberIds.length) {
        await mongooseSession.abortTransaction();
        return NextResponse.json(
          { error: "Duplicate members in request" },
          { status: 400 }
        );
      }

      // Validate member ownership
      const userMemberIds = user.members.map((m) => m._id.toString());
      const invalidMembers = requestedMemberIds.filter(
        (id) => !userMemberIds.includes(id)
      );
      if (invalidMembers.length > 0) {
        await mongooseSession.abortTransaction();
        return NextResponse.json(
          { error: "Invalid member IDs detected" },
          { status: 400 }
        );
      }

      // Check existing bookings
      const existingMemberBookings = existingTickets
        .filter((t) => t.BookedFor === "Member")
        .flatMap((t) => t.members.map((m) => m.toString()));

      const duplicateBookings = requestedMemberIds.filter((id) =>
        existingMemberBookings.includes(id)
      );

      if (duplicateBookings.length > 0) {
        await mongooseSession.abortTransaction();
        return NextResponse.json(
          { error: "Some members already have tickets" },
          { status: 400 }
        );
      }

      // Generate tickets
      const newTickets = await Promise.all(
        tickets.map(async (ticketReq) => {
          const ticketNumber = uuidv4();
          const qrCode = await QRCode.toDataURL(
            JSON.stringify({
              ticketNumber,
              eventId,
              userId,
            })
          );

          return new Ticket({
            eventId,
            ticketNumber,
            BookedFor: ticketReq.bookedFor,
            members:
              ticketReq.bookedFor === "Member" ? [ticketReq.memberId] : [],
            qrCode,
            status: "Active",
          });
        })
      );

      // Save all tickets
      const savedTickets = await Ticket.insertMany(newTickets, {
        session: mongooseSession,
      });

      // Update user's tickets
      user.tickets.push(...savedTickets.map((t) => t._id));
      await user.save({ session: mongooseSession });

      await mongooseSession.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          tickets: savedTickets.map((ticket) => ({
            id: ticket._id,
            ticketNumber: ticket.ticketNumber,
            type: ticket.BookedFor,
            qrCode: ticket.qrCode,
            status: ticket.status,
          })),
        },
        { status: 201 }
      );
    } catch (error) {
      await mongooseSession.abortTransaction();
      console.error("Booking error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    } finally {
      await mongooseSession.endSession();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
