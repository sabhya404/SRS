import { connectDB } from "@/dbConnect";
import User from "@/model/User.model";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
// In /api/auth/verify/route.js
export async function POST(request) {
  try {
    const { OTPtoken, verifyCode } = await request.json();

    await connectDB();
    const usertoken = jwt.decode(OTPtoken, process.env.OTPJWTKEY);
    console.log(usertoken.newUser.email);
    const email = usertoken.newUser.email;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if code is valid and not expired
    if (user.verifyCode !== verifyCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.verifyCodeExpiry)) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Update user to verified and active
    user.emailVerified = true;
    user.isActive = true;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify route:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
