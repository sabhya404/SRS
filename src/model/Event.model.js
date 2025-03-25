import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "Start date must be in the future",
      },
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineUrl: {
      type: String,
      required: function () {
        return this.isOnline;
      },
    },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    ticketsSold: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return value <= this.capacity;
        },
        message: "Tickets sold cannot exceed capacity",
      },
    },
    categories: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Draft",
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    terms: {
      type: [String, "terms and condition"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining tickets
eventSchema.virtual("ticketsRemaining").get(function () {
  return this.capacity - this.ticketsSold;
});

// Indexes for common queries
eventSchema.index({ startDate: 1 });
eventSchema.index({ "location.city": 1 });
eventSchema.index({ categories: 1 });
eventSchema.index({ organizer: 1 });

// Pre-save validation
eventSchema.pre("save", function (next) {
  if (this.ticketsSold > this.capacity) {
    const err = new Error("Tickets sold exceeds capacity");
    return next(err);
  }
  next();
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
