import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/model/User.model";
import Member from "@/model/Member.model";
import { connectDB } from "@/dbConnect/index";

export async function POST(request) {
  try {
    // Fetch the session properly
    const session = await getServerSession(authOptions);

    //Handle missing session
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    //  Get the authenticated user's ID
    const userId = session.user.id;

    //  Validate request body
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    //  Connect to the database
    await connectDB();

    //  Create a new member
    const newMember = new Member({
      name: body.name,
      email: body.email,
      phone: body.phone,
      relationship: body.relationship,
    });

    const savedMember = await newMember.save();

    // Add member to user's family members
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { members: savedMember._id } },
      { new: true }
    );

    if (!updatedUser) {
      await Member.findByIdAndDelete(savedMember._id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(savedMember, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
