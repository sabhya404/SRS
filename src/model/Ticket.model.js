import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    category: { type: String, required: true },
    seatType: {
      type: String,
      enum: ["general", "soldier", "colonel", "vip"],
      required: true,
    },
    ticketNumber: { type: String, required: true, unique: true },
    purchaseDate: { type: Date, default: Date.now },
    BookedFor: {
      type: String,
      enum: ["Primary", "Member"],
      default: "Primary",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User.members",
        required: function () {
          return this.issuedFor === "Member";
        },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Used", "Cancelled", "Expired"],
      default: "Active",
    },
    qrCode: { type: String, required: true }, // URL or base64 of QR code
  },
  { timestamps: true }
);
ticketSchema.index({ ticketNumber: 1, eventId: 1 });

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
