// components/SeatBooking.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Info, Loader2, Tag, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemAnimation = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function TicketBooking({ eventId }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [categoryInfo, setCategoryInfo] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      return "transparent"; // Transparent for empty seats
    }

    if (seat.status === "booked") {
      return "#d1d5db"; // Gray for booked seats
    }

    if (seat.status === "reserved") {
      return "#fbbf24"; // Amber for reserved seats
    }

    const seatId = `${seat.rowIndex}-${seat.colIndex}`;
    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) {
      return "#10b981"; // Emerald green for selected seats
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col justify-center items-center h-96 w-full"
      >
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          Loading venue...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col justify-center items-center h-96 w-full"
      >
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-3 max-w-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!venue) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex justify-center items-center h-96"
      >
        <p className="text-lg text-muted-foreground">
          No venue found for this event.
        </p>
      </motion.div>
    );
  }

  const SeatSelection = () => (
    <Card
      as={motion.div}
      variants={itemAnimation}
      className={`rounded-xl shadow-lg ${fullscreen ? "fixed inset-0 z-50 m-0 rounded-none overflow-auto" : ""}`}
    >
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Venue Layout</CardTitle>
            <CardDescription>Select your seats for the event</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFullscreen(!fullscreen)}
            className="shrink-0"
          >
            {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="zoom" className="flex items-center gap-2">
              <span>Zoom:</span>
              <Badge variant="outline" className="font-normal">
                {zoom.toFixed(1)}x
              </Badge>
            </Label>
            <div className="w-32">
              <Slider
                id="zoom"
                min={0.5}
                max={2}
                step={0.1}
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
              />
            </div>
          </div>

          <div className="hidden md:flex gap-2 text-sm">
            {[
              { color: "transparent", label: "No seat" },
              { color: "#d1d5db", label: "Booked" },
              { color: "#fbbf24", label: "Reserved" },
              { color: "#10b981", label: "Selected" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-sm`}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-auto rounded-lg border bg-gradient-to-b from-slate-50 to-white p-4">
          <div className="flex justify-center">
            <motion.div
              className="bg-slate-200/50 border border-slate-300/50 rounded-lg p-6 mb-8"
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="text-center text-sm font-medium mb-6 uppercase text-slate-500 tracking-wide">
                Stage
              </div>
              <div
                className="grid gap-1 mx-auto"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  width: "fit-content",
                }}
              >
                {venue.seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 relative">
                    <div className="absolute -left-6 top-0 bottom-0 flex items-center justify-center w-4 text-[10px] text-slate-500 font-medium">
                      {rowIndex + 1}
                    </div>
                    {row.map((seat, colIndex) => {
                      // Add rowIndex and colIndex to seat for easier reference
                      const seatWithPos = { ...seat, rowIndex, colIndex };
                      const seatId = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedSeats.some(
                        (s) => s.id === seatId
                      );
                      const isBookable =
                        seat.categoryId && seat.status === "available";
                      const isSeat = seat.categoryId !== undefined;

                      // Only render seat elements for actual seats (not empty spaces)
                      return (
                        <TooltipProvider key={colIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={
                                  isBookable ? { scale: 1.2, zIndex: 10 } : {}
                                }
                                whileTap={isBookable ? { scale: 0.95 } : {}}
                                className={`
                                  w-6 h-6 rounded-sm
                                  ${isSelected ? "ring-2 ring-primary shadow-sm" : isSeat ? "border border-gray-200" : ""}
                                  ${isBookable ? "cursor-pointer" : isSeat ? "cursor-not-allowed" : ""}
                                  transition-all duration-200
                                `}
                                style={{
                                  backgroundColor: getSeatColor(seatWithPos),
                                  visibility: isSeat ? "visible" : "visible",
                                }}
                                onClick={() =>
                                  isBookable &&
                                  handleSeatClick(rowIndex, colIndex)
                                }
                              >
                                {isSelected && (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <Check size={12} className="text-white" />
                                  </div>
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            {isSeat && (
                              <TooltipContent side="top" className="z-50">
                                <div className="text-xs">
                                  <div className="font-medium">
                                    {seat.categoryId
                                      ? `${categoryInfo[seat.categoryId]?.name || "Standard"} ${
                                          seat.subcategoryId
                                            ? `- ${categoryInfo[seat.categoryId]?.subcategories[seat.subcategoryId]?.name || ""}`
                                            : ""
                                        }`
                                      : "No seat"}
                                  </div>
                                  <div className="opacity-80 mt-1">
                                    Row {rowIndex + 1}, Seat {colIndex + 1}
                                  </div>
                                  <div className="mt-1 flex items-center gap-1">
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full ${
                                        getSeatStatus(seatWithPos) ===
                                        "Available"
                                          ? "bg-green-500"
                                          : getSeatStatus(seatWithPos) ===
                                              "Selected"
                                            ? "bg-primary"
                                            : getSeatStatus(seatWithPos) ===
                                                "Reserved"
                                              ? "bg-amber-500"
                                              : "bg-gray-500"
                                      }`}
                                    ></span>
                                    <span>{getSeatStatus(seatWithPos)}</span>
                                  </div>
                                  {seat.categoryId &&
                                    seat.status === "available" && (
                                      <div className="mt-1 font-medium">
                                        $
                                        {getSeatPrice(
                                          seat.categoryId,
                                          seat.subcategoryId
                                        ).toFixed(2)}
                                      </div>
                                    )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
      {fullscreen && (
        <CardFooter className="flex justify-end gap-2 bg-background p-4">
          <Button variant="outline" onClick={() => setFullscreen(false)}>
            Close
          </Button>
          <Button
            disabled={selectedSeats.length === 0}
            onClick={proceedToBooking}
          >
            Continue with {selectedSeats.length}{" "}
            {selectedSeats.length === 1 ? "seat" : "seats"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  const SelectionSidebar = () => (
    <div className="space-y-4">
      <motion.div variants={itemAnimation}>
        <Card className="rounded-xl shadow-md overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <Tag size={18} />
              Your Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Selected Seats</Label>
                  <Badge variant="outline">{selectedSeats.length}</Badge>
                </div>
                {selectedSeats.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedSeats.map((seat) => (
                      <motion.div
                        key={seat.id}
                        variants={itemAnimation}
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center text-sm p-3 bg-primary/5 rounded-lg border border-primary/10"
                      >
                        <span className="font-medium">
                          Row {seat.row + 1}, Seat {seat.col + 1}
                        </span>
                        <Badge variant="secondary">
                          ${seat.price.toFixed(2)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="bg-slate-100 w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center">
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
                        <rect x="4" y="6" width="16" height="12" rx="2" />
                        <line x1="12" y1="10" x2="12" y2="14" />
                      </svg>
                    </div>
                    <p className="text-sm">No seats selected yet</p>
                    <p className="text-xs mt-1">
                      Click on available seats in the venue layout
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Service Fee
                  </span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium text-lg">
                  <span>Total</span>
                  <span>${(totalPrice * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="bg-slate-50 px-6 py-4">
            <Button
              className="w-full"
              size="lg"
              disabled={selectedSeats.length === 0}
              onClick={proceedToBooking}
            >
              {selectedSeats.length > 0
                ? "Proceed to Checkout"
                : "Select Seats"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemAnimation}>
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info size={16} />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm">
                  {venue.event?.title || "Event Title"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {venue.event?.date || "Event Date"}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                  Legend
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { color: "transparent", label: "No seat", border: false },
                    { color: "#d1d5db", label: "Booked", border: false },
                    { color: "#fbbf24", label: "Reserved", border: false },
                    { color: "#10b981", label: "Selected", border: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-sm ${item.border ? "border border-dashed border-slate-300" : ""}`}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {venue.event && venue.event.categories && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                    Pricing Categories
                  </h4>
                  <div className="space-y-1.5">
                    {venue.event.categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm border border-slate-200"
                            style={{
                              backgroundColor:
                                venue.categoryColors[category._id],
                            }}
                          ></div>
                          <span>{category.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-normal text-[10px]"
                        >
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
      </motion.div>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="container mx-auto py-8 px-4"
    >
      <motion.div
        variants={fadeIn}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
            Select Your Seats
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose your preferred seats for {venue.event?.title || "this event"}
          </p>
        </div>

        {/* Mobile: Show sheet trigger button for seat selection on small screens */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button className="md:hidden">
              {selectedSeats.length > 0 ? (
                <>View Selection ({selectedSeats.length})</>
              ) : (
                "View Selection"
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle>Your Selection</SheetTitle>
            </SheetHeader>
            <div className="p-6 overflow-auto">
              <SelectionSidebar />
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seat Selection - Main Content */}
        <div className="lg:col-span-3">
          <SeatSelection />
        </div>

        {/* Right Sidebar - Hidden on mobile (shown in sheet) */}
        <div className="hidden md:block lg:col-span-1">
          <SelectionSidebar />
        </div>
      </div>

      {/* Event Information Box */}
      <motion.div
        variants={fadeIn}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm"
      >
        <div className="flex items-start">
          <div className="mr-4 text-blue-600 bg-blue-100 p-2 rounded-full">
            <Info size={18} />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Need Help?</h3>
            <p className="text-sm text-blue-800 mt-1">
              If you have any questions about seating arrangements or
              accessibility options, please contact our support team at
              support@eventname.com or call (555) 123-4567.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
