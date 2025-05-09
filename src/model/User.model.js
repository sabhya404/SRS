import mongoose from "mongoose";
import Member from "./Member.model";
import Ticket from "./Seat.model";
const userSchema = new mongoose.Schema(
  {
    //for authantication
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // resetToken: {
    //   type: String,
    //   default: null,
    // },
    // resetTokenExpiry: {
    //   type: Date,
    //   default: null,
    // },
    verifyCode: { type: String, required: [true, "Verify Code is required"] },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify Code Expiry is required"],
    },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    //for personal details
    /*firstName: { type: String, required: true },
    lastName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    }, // URL to image
    phone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },*/
    //for member
    // members: [Member],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    //for ticket
    // tickets: [Ticket],
    tickets: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Ticket",
    },
    //for event listing
    //have to make changes according to give details
    isOrganizer: { type: Boolean, default: true },
    organizerDetails: {
      name: { type: String },
      website: { type: String },
      description: { type: String },
      verificationStatus: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },
      documents: [{ type: String }], // URLs to uploaded verification documents
    },
  },
  { timestamps: true }
);

// Export User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
