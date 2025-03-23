import mongoose from "mongoose";
const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    relationship: { type: String, required: false }, // e.g., "Family", "Friend", "Colleague"
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;
