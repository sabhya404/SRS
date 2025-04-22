// components/TicketBooking.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function TicketBooking({ eventId, event, venueData }) {
  const router = useRouter();

  // Booking states
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  // Filter seats based on selected category
  const filteredSeats = selectedCategory
    ? venueData.seats.map((row, rowIndex) =>
        row.map((seat, colIndex) => ({
          ...seat,
          rowIndex,
          colIndex,
          isVisible: seat.categoryId === selectedCategory,
        }))
      )
    : venueData.seats.map((row, rowIndex) =>
        row.map((seat, colIndex) => ({
          ...seat,
          rowIndex,
          colIndex,
          isVisible: seat.categoryId !== null,
        }))
      );

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedSeats.length) return 0;

    let total = 0;
    selectedSeats.forEach((seat) => {
      const category = event.categories.find((c) => c._id === seat.categoryId);
      if (category) {
        if (seat.subcategoryId) {
          const subcategory = category.subcategories.find(
            (s) => s._id === seat.subcategoryId
          );
          total += subcategory?.price || 0;
        } else {
          total += category.basePrice || 0;
        }
      }
    });

    return total;
  };

  // Handle seat selection
  const handleSeatClick = (rowIndex, colIndex) => {
    const seat = venueData.seats[rowIndex][colIndex];

    // Skip if no seat or seat is already booked
    if (!seat.categoryId || seat.status === "booked") return;

    // Check if seat is already selected
    const seatIndex = selectedSeats.findIndex(
      (s) => s.rowIndex === rowIndex && s.colIndex === colIndex
    );

    if (seatIndex !== -1) {
      // Remove seat if already selected
      setSelectedSeats((prev) => prev.filter((_, i) => i !== seatIndex));
    } else {
      // Add seat to selection
      setSelectedSeats((prev) => [
        ...prev,
        {
          rowIndex,
          colIndex,
          categoryId: seat.categoryId,
          subcategoryId: seat.subcategoryId,
          seatLabel: `Row ${rowIndex + 1}, Seat ${colIndex + 1}`,
        },
      ]);
    }
  };

  // Get category and price info for a seat
  const getSeatInfo = (seat) => {
    if (!seat || !seat.categoryId) return { name: "Not Available", price: 0 };

    const category = event.categories.find((c) => c._id === seat.categoryId);
    if (!category) return { name: "Unknown", price: 0 };

    if (seat.subcategoryId) {
      const subcategory = category.subcategories.find(
        (s) => s._id === seat.subcategoryId
      );
      return {
        name: `${category.name} - ${subcategory?.subName || ""}`,
        price: subcategory?.price || 0,
      };
    }

    return {
      name: category.name,
      price: category.basePrice || 0,
    };
  };

  // Get color for a seat
  const getSeatColor = (seat) => {
    // If seat is selected, show selection color
    if (
      selectedSeats.some(
        (s) => s.rowIndex === seat.rowIndex && s.colIndex === seat.colIndex
      )
    ) {
      return "#4caf50"; // Green for selected
    }

    // If seat is booked, show as unavailable
    if (seat.status === "booked") {
      return "#e0e0e0"; // Gray for booked
    }

    // Otherwise, show category/subcategory color
    if (!seat || !seat.categoryId) {
      return "#f0f0f0"; // Default color for empty seats
    }

    return seat.subcategoryId
      ? venueData.subcategoryColors[seat.subcategoryId]
      : venueData.categoryColors[seat.categoryId];
  };

  // Process booking
  const processBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert("Please provide your name and email");
      return;
    }

    setIsLoading(true);

    try {
      // Create booking object
      const booking = {
        eventId,
        seats: selectedSeats.map((seat) => ({
          rowIndex: seat.rowIndex,
          colIndex: seat.colIndex,
          categoryId: seat.categoryId,
          subcategoryId: seat.subcategoryId,
        })),
        customer: customerInfo,
        totalPrice: calculateTotal(),
        bookingDate: new Date().toISOString(),
      };

      // Submit booking to API
      const response = await axios.post("/api/bookings", booking);

      if (response.data.success) {
        setBookingComplete(true);
        setBookingReference(
          response.data.bookingReference ||
            "TKT-" + Math.random().toString(36).substring(2, 10).toUpperCase()
        );
      } else {
        alert(`Booking failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error processing booking:", error);
      alert(`Booking error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset booking
  const resetBooking = () => {
    setSelectedSeats([]);
    setCustomerInfo({
      name: "",
      email: "",
      phone: "",
    });
    setBookingComplete(false);
    setBookingReference("");
    setIsCheckoutOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Book Tickets: {event.title}</h1>
        <Badge variant="outline" className="text-lg">
          {new Date(event.date).toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls and Selection */}
        <div className="lg:col-span-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Filter by Category</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedCategory(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {event.categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Seats</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No seats selected
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSeats.map((seat, index) => {
                    const info = getSeatInfo(
                      venueData.seats[seat.rowIndex][seat.colIndex]
                    );
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{seat.seatLabel}</p>
                          <p className="text-sm text-gray-600">{info.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${info.price}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedSeats((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <div className="w-full flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>

              <Button
                className="w-full"
                disabled={selectedSeats.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content - Venue Layout */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Venue Layout</CardTitle>
              <p className="text-gray-500">
                Select your seats by clicking on the available seats in the
                layout
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto p-4 border rounded-md">
                <div className="flex justify-center items-center mb-4 py-2 bg-gray-200 rounded">
                  <div className="w-3/4 h-2 bg-gray-400 rounded-lg"></div>
                  <p className="ml-2 text-sm">STAGE</p>
                </div>

                <div
                  className="grid gap-1 mx-auto"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    width: "fit-content",
                  }}
                >
                  {filteredSeats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      <div className="w-6 flex items-center justify-center text-xs font-medium text-gray-500">
                        {rowIndex + 1}
                      </div>
                      {row.map((seat, colIndex) => (
                        <TooltipProvider key={colIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`
                                  w-6 h-6 rounded-sm cursor-pointer border
                                  ${!seat.isVisible ? "opacity-30" : ""}
                                  ${seat.status === "booked" ? "cursor-not-allowed" : ""}
                                  ${
                                    selectedSeats.some(
                                      (s) =>
                                        s.rowIndex === rowIndex &&
                                        s.colIndex === colIndex
                                    )
                                      ? "border-primary border-2"
                                      : "border-gray-300"
                                  }
                                `}
                                style={{
                                  backgroundColor: getSeatColor({
                                    ...seat,
                                    rowIndex,
                                    colIndex,
                                  }),
                                  display: seat.categoryId ? "block" : "none",
                                }}
                                onClick={() =>
                                  handleSeatClick(rowIndex, colIndex)
                                }
                              ></div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {seat.categoryId ? (
                                <>
                                  <div className="font-medium">
                                    {getSeatInfo(seat).name}
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span>
                                      Row {rowIndex + 1}, Seat {colIndex + 1}
                                    </span>
                                    <span>${getSeatInfo(seat).price}</span>
                                  </div>
                                  <div className="text-xs mt-1">
                                    {seat.status === "booked"
                                      ? "Already booked"
                                      : "Available"}
                                  </div>
                                </>
                              ) : (
                                "No seat"
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      <div className="w-6 flex items-center justify-center text-xs font-medium text-gray-500">
                        {rowIndex + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span className="text-sm">No seat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-e0e0e0 rounded"></div>
                      <span className="text-sm">Already booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-4caf50 rounded"></div>
                      <span className="text-sm">Selected by you</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Category Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {event.categories.map((category) => (
                  <div key={category._id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: venueData.categoryColors[category._id],
                      }}
                    ></div>
                    <div>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-xs ml-2">
                        ${category.basePrice}
                      </span>
                    </div>
                  </div>
                ))}

                {event.categories.flatMap((category) =>
                  category.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: venueData.subcategoryColors[sub._id],
                        }}
                      ></div>
                      <div>
                        <span className="text-sm">{sub.subName}</span>
                        <span className="text-xs ml-2">${sub.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {!bookingComplete ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Booking</DialogTitle>
                <DialogDescription>
                  Please enter your details to complete the booking for{" "}
                  {selectedSeats.length} seat(s).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-lg font-bold flex justify-between">
                    <span>Total Amount:</span>
                    <span>${calculateTotal()}</span>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto">
                    <p className="font-medium mb-2">Selected Seats:</p>
                    <ul className="space-y-1 text-sm">
                      {selectedSeats.map((seat, index) => {
                        const info = getSeatInfo(
                          venueData.seats[seat.rowIndex][seat.colIndex]
                        );
                        return (
                          <li key={index} className="flex justify-between">
                            <span>{seat.seatLabel}</span>
                            <span>
                              {info.name} - ${info.price}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processBooking}
                  disabled={
                    isLoading || !customerInfo.name || !customerInfo.email
                  }
                >
                  {isLoading ? "Processing..." : "Complete Booking"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-green-600">
                  Booking Confirmed!
                </DialogTitle>
              </DialogHeader>

              <div className="py-6 space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold">
                    Thank you, {customerInfo.name}!
                  </h3>
                  <p className="text-gray-500 text-center mt-1">
                    Your booking has been confirmed. A confirmation email has
                    been sent to {customerInfo.email}
                  </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Booking Reference:</span>
                    <span className="font-bold">{bookingReference}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Event:</span>
                    <span>{event.title}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full" onClick={resetBooking}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
