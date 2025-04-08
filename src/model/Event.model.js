import mongoose from "mongoose";

// Subcategory schema
const subcategorySchema = new mongoose.Schema({
  subName: {
    type: String,
    required: true,
    trim: true,
  },
  subSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  booked: {
    type: Number,
    default: 0,
  },
});

// Seat category schema
const seatCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  subcategories: [subcategorySchema],

  // Legacy booking structure - can be used alongside subcategories during transition
  // booked: {
  //   general: { type: Number, default: 0 },
  //   soldier: { type: Number, default: 0 },
  //   colonel: { type: Number, default: 0 },
  //   vip: { type: Number, default: 0 },
  // },
  // For layout
  color: {
    type: String,
  },
});

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
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
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    type: {
      type: String,
      required: [true, "Event type is required"],
      index: true,
    },
    categories: [seatCategorySchema],
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
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Draft",
    },
    terms: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save validation to check subcategories total matches category total
eventSchema.pre("save", function (next) {
  try {
    // Check ticket sales
    if (this.ticketsSold > this.capacity) {
      throw new Error("Tickets sold exceeds capacity");
    }

    // Validate subcategory seats against category total
    for (const category of this.categories) {
      if (category.subcategories && category.subcategories.length > 0) {
        const subTotal = category.subcategories.reduce(
          (sum, sub) => sum + sub.subSeats,
          0
        );
        if (subTotal > category.totalSeats) {
          throw new Error(
            `Subcategories in "${category.name}" exceed total seats (${subTotal} > ${category.totalSeats})`
          );
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for remaining tickets
eventSchema.virtual("ticketsRemaining").get(function () {
  return this.capacity - this.ticketsSold;
});

// Indexes for common queries
eventSchema.index({ startDate: 1 });
eventSchema.index({ "location.city": 1 });
eventSchema.index({ categories: 1 });
eventSchema.index({ organizer: 1 });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
