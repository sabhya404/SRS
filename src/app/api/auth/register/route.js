import { connectDB } from "@/dbConnect/index";
import { NextResponse } from "next/server";
import User from "@/model/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
export async function POST(request) {
  try {
    const { username, email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set expiry time
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Save new user with inactive status
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry: expiryDate,
      emailVerified: false, // Ensure this is explicitly set
      isActive: false, // Add this field to your model
    });
    await newUser.save();
    //generate token for otp verification url
    const tokenOTP = jwt.sign({ newUser }, process.env.OTPJWTKEY);

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, verifyCode);
    if (!emailResponse.success) {
      return NextResponse.json(
        { error: `Email sending failed: ${emailResponse.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Verification code sent to your email. Please verify to complete registration.",
        email: email, // Send back email for the verification page
        OTPtoken: tokenOTP,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in register route:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
