// components/SeatBooking.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function TicketBooking({ eventId }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [categoryInfo, setCategoryInfo] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);

        // Check if eventId is valid
        if (!eventId) {
          throw new Error("Event ID is missing");
        }

        console.log(`Fetching venue data for event: ${eventId}`);

        // Make sure this URL matches your API route structure
        const response = await axios.get(`/api/venue?eventId=${eventId}`);

        console.log("API response:", response);
        if (response.data.success === true) {
          setLoading(false);
          setVenue(response.data);
        }
        setVenue(response.data);

        // Rest of your code to process the response...
      } catch (err) {
        console.error("Error fetching venue:", err);

        // More detailed error message based on the response
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load venue data";

        setError(`${errorMsg} (Status: ${err.response?.status || "unknown"})`);
        setLoading(false);
      }
    };

    if (eventId) {
      fetchVenueData();
    }
  }, [eventId]);

  // Handle seat selection
  const handleSeatClick = (rowIndex, colIndex) => {
    const seat = venue.seats[rowIndex][colIndex];

    // Skip if no seat or already booked
    if (
      !seat.categoryId ||
      seat.status === "booked" ||
      seat.status === "reserved"
    ) {
      return;
    }

    const seatId = `${rowIndex}-${colIndex}`;
    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) {
      // Remove from selection
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
    } else {
      // Add to selection
      const newSeat = {
        id: seatId,
        row: rowIndex,
        col: colIndex,
        categoryId: seat.categoryId,
        subcategoryId: seat.subcategoryId,
        price: getSeatPrice(seat.categoryId, seat.subcategoryId),
      };
      setSelectedSeats((prev) => [...prev, newSeat]);
    }
  };

  // Calculate total price whenever selected seats change
  useEffect(() => {
    const price = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    setTotalPrice(price);
  }, [selectedSeats]);

  // Get price for a seat based on its category and subcategory
  const getSeatPrice = (categoryId, subcategoryId) => {
    if (!categoryInfo[categoryId]) return 0;

    if (
      subcategoryId &&
      categoryInfo[categoryId].subcategories[subcategoryId]
    ) {
      return categoryInfo[categoryId].subcategories[subcategoryId].price;
    }

    return categoryInfo[categoryId].price;
  };

  // Get the color for a seat
  const getSeatColor = (seat) => {
    if (!seat || !seat.categoryId) {
      return "white"; // White for empty seats (no seat)
    }

    if (seat.status === "booked") {
      return "#cccccc"; // Gray for booked seats
    }

    if (seat.status === "reserved") {
      return "#ffaa00"; // Orange for reserved seats
    }

    const seatId = `${seat.rowIndex}-${seat.colIndex}`;
    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) {
      return "#9CA3AF"; // Gray for selected seats (tailwind gray-400 equivalent)
    }

    return seat.subcategoryId
      ? venue.subcategoryColors[seat.subcategoryId]
      : venue.categoryColors[seat.categoryId];
  };

  // Get the status text for a seat
  const getSeatStatus = (seat) => {
    if (!seat || !seat.categoryId) return "No seat";
    if (seat.status === "booked") return "Booked";
    if (seat.status === "reserved") return "Reserved";

    const seatId = `${seat.rowIndex}-${seat.colIndex}`;
    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) return "Selected";
    return "Available";
  };

  // Proceed to booking
  const proceedToBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to book.");
      return;
    }

    try {
      // Format selected seats for the API
      const bookingData = {
        eventId,
        seats: selectedSeats.map((seat) => ({
          row: seat.row,
          col: seat.col,
          categoryId: seat.categoryId,
          subcategoryId: seat.subcategoryId,
        })),
        totalPrice,
      };

      // Note: This is where you would redirect to checkout or processing
      // For now, we'll just log the data that would be sent
      console.log("Booking data:", bookingData);

      // Redirect to checkout
      // router.push(`/checkout?booking=${encodeURIComponent(JSON.stringify(bookingData))}`);

      // Or post to an API endpoint
      // const response = await axios.post('/api/bookings/create', bookingData);
      // if (response.data.success) {
      //   router.push(`/bookings/${response.data.bookingId}`);
      // }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading venue...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex justify-center items-center h-64">
        No venue found for this event.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Select Your Seats</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Selected Seats & Instructions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoom">Zoom: {zoom.toFixed(1)}x</Label>
                <Slider
                  id="zoom"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Selected Seats: {selectedSeats.length}</Label>
                {selectedSeats.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                      >
                        <span>
                          Row {seat.row + 1}, Seat {seat.col + 1}
                        </span>
                        <span>${seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No seats selected</div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Price:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={selectedSeats.length === 0}
                onClick={proceedToBooking}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Seat Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded"></div>
                  <span className="text-sm">No seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 border-2 border-blue-500 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>

                {/* Display categories */}
                {venue.event && venue.event.categories && (
                  <div className="mt-4 space-y-2">
                    <Label className="font-medium">Categories:</Label>
                    <div className="space-y-1 mt-2">
                      {venue.event.categories.map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  venue.categoryColors[category._id],
                              }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                          <Badge>
                            {category.price
                              ? `$${category.price.toFixed(2)}`
                              : "Varies"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Venue Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Venue Layout</CardTitle>
              <p className="text-sm text-gray-500">
                Click on available seats to select them
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto p-4 border rounded-md bg-white">
                <h1 className="flex justify-center border-2">Stage</h1>
                <div
                  className="grid gap-1 mx-auto"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: "fit-content",
                  }}
                >
                  {venue.seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      {row.map((seat, colIndex) => {
                        // Add rowIndex and colIndex to seat for easier reference
                        const seatWithPos = { ...seat, rowIndex, colIndex };
                        const seatId = `${rowIndex}-${colIndex}`;
                        const isSelected = selectedSeats.some(
                          (s) => s.id === seatId
                        );
                        const isBookable =
                          seat.categoryId && seat.status === "available";

                        return (
                          <TooltipProvider key={colIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`
                                    w-6 h-6 rounded-sm
                                    ${isSelected ? "border-2 border-blue-500" : seat.categoryId ? "border border-gray-300" : ""}
                                    ${isBookable ? "cursor-pointer hover:opacity-80" : seat.categoryId ? "cursor-not-allowed opacity-70" : ""}
                                  `}
                                  style={{
                                    backgroundColor: getSeatColor(seatWithPos),
                                  }}
                                  onClick={() =>
                                    isBookable &&
                                    handleSeatClick(rowIndex, colIndex)
                                  }
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs font-medium">
                                  {seat.categoryId
                                    ? `${categoryInfo[seat.categoryId]?.name || "Unknown"} ${
                                        seat.subcategoryId
                                          ? `- ${categoryInfo[seat.categoryId]?.subcategories[seat.subcategoryId]?.name || ""}`
                                          : ""
                                      }`
                                    : "No seat"}
                                </div>
                                <div className="text-xs">
                                  Row {rowIndex + 1}, Seat {colIndex + 1}
                                </div>
                                <div className="text-xs mt-1">
                                  Status: {getSeatStatus(seatWithPos)}
                                </div>
                                {seat.categoryId &&
                                  seat.status === "available" && (
                                    <div className="text-xs mt-1">
                                      Price: $
                                      {getSeatPrice(
                                        seat.categoryId,
                                        seat.subcategoryId
                                      ).toFixed(2)}
                                    </div>
                                  )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex items-center">
              <div className="mr-2 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Venue Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  {venue.event?.title
                    ? `Event: ${venue.event.title}`
                    : "Select your preferred seats by clicking on the available spaces in the venue layout."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
