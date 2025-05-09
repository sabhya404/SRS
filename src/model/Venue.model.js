import mongoose from "mongoose";
const seatSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event.categories",
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event.categories.subcategories",
  },
  // Seat status
  status: {
    type: String,
    enum: ["available", "booked", "reserved", "none"],
    default: "available",
  },
});

const venueSchema = new mongoose.Schema(
  {
    // Reference to the associated event
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    // Venue shape configuration
    shape: {
      type: String,
      default: "rectangle",
    },

    // Dimensions of the venue grid
    dimensions: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
    },

    // Store seats as a 2D array/matrix
    seats: {
      type: [[seatSchema]],
      required: true,
    },

    // Color maps for visual representation
    categoryColors: {
      type: Map,
      of: String,
    },

    subcategoryColors: {
      type: Map,
      of: String,
    },

    // For more complex venues with multiple sections

    // Flag to mark if layout is complete
    isLayoutComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//define a method to get the seat availability
venueSchema.methods.getSeatStatus = function (row, col) {
  if (
    row < 0 ||
    row >= this.dimensions.rows ||
    col < 0 ||
    col >= this.dimensions.cols
  ) {
    throw new Error("Invalid seat coordinates");
  }
  return this.seats[row][col].status;
};

const Venue = mongoose.models.Venue || mongoose.model("Venue", venueSchema);

export default Venue;
