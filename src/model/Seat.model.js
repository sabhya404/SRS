// models/SeatBooking.model.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true,
    min: 0,
  },
  col: {
    type: Number,
    required: true,
    min: 0,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,

    required: true,
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const seatBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seats: [seatSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique booking number
seatBookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const prefix =
      "BK" +
      date.getFullYear().toString().substr(-2) +
      (date.getMonth() + 1).toString().padStart(2, "0");

    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.bookingNumber = `${prefix}-${randomPart}`;
  }

  // Set expiration for pending bookings (15 minutes)
  if (this.status === "pending" && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  }

  next();
});

// Create compound index for eventId + seats to prevent double bookings
seatBookingSchema.index(
  {
    eventId: 1,
    "seats.row": 1,
    "seats.col": 1,
  },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
  }
);

const SeatBooking =
  mongoose.models.SeatBooking ||
  mongoose.model("SeatBooking", seatBookingSchema);

export default SeatBooking;
