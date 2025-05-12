// File: /app/api/user/tickets/latest/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/dbConnect/index";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectDB();

    // Find the latest ticket for the current user
    const ticket = await db
      .collection("tickets")
      .findOne({ userId: session.user.id }, { sort: { createdAt: -1 } });

    if (!ticket) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      _id: ticket._id,
      bookingNumber: ticket.bookingNumber,
    });
  } catch (error) {
    console.error("Error fetching latest ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
