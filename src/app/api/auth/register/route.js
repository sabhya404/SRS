import { NextResponse } from "next/server";
import { connectDB } from "@/dbConnect/index";
import User from "@/model/User.model";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request) {
  try {
    // fill details
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

    // Save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry: expiryDate,
    });
    await newUser.save();

    console.log(email, password, verifyCode);

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
          "User Registered Successfully. Please check your email for verification code.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in register route:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
