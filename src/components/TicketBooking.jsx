// components/SeatBooking.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TicketBooking({ eventId }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [categoryInfo, setCategoryInfo] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [tempReservedSeats, setTempReservedSeats] = useState({});
  const [notification, setNotification] = useState(null);

  // Socket.io reference
  const socketRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!eventId) return;

    // Connect to the Socket.IO server
    socketRef.current = io({
      path: "/api/socket",
      query: { eventId },
    });

    // Set up event listeners
    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.IO server");

      // Join the event room
      socketRef.current.emit("joinEvent", { eventId });
    });

    socketRef.current.on("activeUsers", (count) => {
      setActiveUsers(count);
    });

    socketRef.current.on("seatTemporaryReserved", (data) => {
      setTempReservedSeats((prev) => ({
        ...prev,
        [`${data.row}-${data.col}`]: {
          ...data,
          timestamp: Date.now(),
        },
      }));

      // Show notification that a seat was reserved by someone else
      if (data.userId !== socketRef.current.id) {
        setNotification({
          type: "info",
          title: "Seat Reserved",
          message: `Row ${data.row + 1}, Seat ${data.col + 1} was temporarily reserved by another user.`,
          timestamp: Date.now(),
        });
      }
    });

    socketRef.current.on("seatTemporaryReleased", (data) => {
      setTempReservedSeats((prev) => {
        const updated = { ...prev };
        delete updated[`${data.row}-${data.col}`];
        return updated;
      });
    });

    socketRef.current.on("seatBooked", (data) => {
      // Update the local venue data to mark the seat as booked
      setVenue((prevVenue) => {
        if (!prevVenue || !prevVenue.seats) return prevVenue;

        const updatedSeats = [...prevVenue.seats];
        if (updatedSeats[data.row] && updatedSeats[data.row][data.col]) {
          updatedSeats[data.row] = [...updatedSeats[data.row]];
          updatedSeats[data.row][data.col] = {
            ...updatedSeats[data.row][data.col],
            status: "booked",
          };
        }

        return {
          ...prevVenue,
          seats: updatedSeats,
        };
      });

      // If one of our selected seats was booked by someone else, remove it from selection
      setSelectedSeats((prev) =>
        prev.filter((seat) => !(seat.row === data.row && seat.col === data.col))
      );

      // Show notification that a seat was booked
      if (data.userId !== socketRef.current.id) {
        setNotification({
          type: "error",
          title: "Seat Booked",
          message: `Row ${data.row + 1}, Seat ${data.col + 1} was booked by another user.`,
          timestamp: Date.now(),
        });
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    socketRef.current.on("error", (errorMsg) => {
      console.error("Socket.IO error:", errorMsg);
      setNotification({
        type: "error",
        title: "Connection Error",
        message: "There was an issue with the live seat updates.",
        timestamp: Date.now(),
      });
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        // Release any temporary reservations
        if (selectedSeats.length > 0) {
          selectedSeats.forEach((seat) => {
            socketRef.current.emit("releaseSeat", {
              eventId,
              row: seat.row,
              col: seat.col,
            });
          });
        }

        socketRef.current.disconnect();
      }
    };
  }, [eventId]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Clean up expired temporary reservations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasExpired = false;

      setTempReservedSeats((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          // Remove temporary reservations older than 5 minutes
          if (now - updated[key].timestamp > 5 * 60 * 1000) {
            delete updated[key];
            hasExpired = true;
          }
        });
        return hasExpired ? updated : prev;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

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

          // Process categories and subcategories into a structured format for easy access
          if (response.data.event && response.data.event.categories) {
            const categories = response.data.event.categories.reduce(
              (acc, category) => {
                // Initialize the category
                acc[category._id] = {
                  name: category.name,
                  price: category.price,
                  subcategories: {},
                };

                // Add subcategories if they exist
                if (
                  category.subcategories &&
                  category.subcategories.length > 0
                ) {
                  category.subcategories.forEach((subcategory) => {
                    acc[category._id].subcategories[subcategory._id] = {
                      name: subcategory.name,
                      price: subcategory.price || category.price,
                    };
                  });
                }

                return acc;
              },
              {}
            );

            setCategoryInfo(categories);
          }
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

    // Skip if no seat or already booked or temp reserved by another user
    if (
      !seat.categoryId ||
      seat.status === "booked" ||
      (tempReservedSeats[`${rowIndex}-${colIndex}`] &&
        tempReservedSeats[`${rowIndex}-${colIndex}`].userId !==
          socketRef.current?.id)
    ) {
      return;
    }

    const seatId = `${rowIndex}-${colIndex}`;
    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) {
      // Remove from selection
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));

      // Notify server to release the seat
      if (socketRef.current) {
        socketRef.current.emit("releaseSeat", {
          eventId,
          row: rowIndex,
          col: colIndex,
        });
      }
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

      // Notify server about temporary reservation
      if (socketRef.current) {
        socketRef.current.emit("reserveSeat", {
          eventId,
          row: rowIndex,
          col: colIndex,
          categoryId: seat.categoryId,
          subcategoryId: seat.subcategoryId,
        });
      }
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
      categoryInfo[categoryId].subcategories &&
      categoryInfo[categoryId].subcategories[subcategoryId]
    ) {
      // Return subcategory price with fallback to category price or 0
      const subPrice =
        categoryInfo[categoryId].subcategories[subcategoryId].price;
      return subPrice !== undefined && subPrice !== null
        ? subPrice
        : categoryInfo[categoryId].price || 0;
    }

    // Return category price or 0 if undefined
    return categoryInfo[categoryId].price !== undefined &&
      categoryInfo[categoryId].price !== null
      ? categoryInfo[categoryId].price
      : 0;
  };

  // Get the color for a seat
  const getSeatColor = (seat) => {
    if (!seat || !seat.categoryId) {
      return "white"; // White for empty seats (no seat)
    }

    if (seat.status === "booked") {
      return "#cccccc"; // Gray for booked seats
    }

    const seatId = `${seat.rowIndex}-${seat.colIndex}`;

    // Check if seat is temporarily reserved by another user
    if (
      tempReservedSeats[seatId] &&
      tempReservedSeats[seatId].userId !== socketRef.current?.id
    ) {
      return "#ffa07a"; // Light salmon for seats temporarily reserved by others
    }

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

    const seatId = `${seat.rowIndex}-${seat.colIndex}`;

    // Check if seat is temporarily reserved by another user
    if (tempReservedSeats[seatId]) {
      return tempReservedSeats[seatId].userId === socketRef.current?.id
        ? "Selected by you"
        : "Temporarily reserved by another user";
    }

    const isSelected = selectedSeats.some((s) => s.id === seatId);

    if (isSelected) return "Selected";
    return "Available";
  };

  // Get category and subcategory name for a seat
  const getSeatCategoryName = (seat) => {
    if (!seat || !seat.categoryId || !categoryInfo[seat.categoryId]) {
      return "Unknown";
    }

    const category = categoryInfo[seat.categoryId];
    const categoryName = category?.name || "Unknown Category";

    if (seat.subcategoryId && category?.subcategories[seat.subcategoryId]) {
      return `${categoryName} - ${category.subcategories[seat.subcategoryId].name}`;
    }

    return categoryName;
  };

  // Proceed to booking
  const proceedToBooking = async () => {
    if (selectedSeats.length === 0) {
      setNotification({
        type: "error",
        title: "No seats selected",
        message: "Please select at least one seat to book.",
        timestamp: Date.now(),
      });
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
      console.log("Booking data:", bookingData);

      // Notify server about booked seats
      if (socketRef.current) {
        selectedSeats.forEach((seat) => {
          socketRef.current.emit("bookSeat", {
            eventId,
            row: seat.row,
            col: seat.col,
          });
        });
      }

      // Redirect to checkout
      // router.push(`/checkout?booking=${encodeURIComponent(JSON.stringify(bookingData))}`);

      // Or post to an API endpoint
      // const response = await axios.post('/api/bookings/create', bookingData);
      // if (response.data.success) {
      //   router.push(`/bookings/${response.data.bookingId}`);
      // }

      setNotification({
        type: "success",
        title: "Booking initiated",
        message: `${selectedSeats.length} seats have been reserved for checkout.`,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      setNotification({
        type: "error",
        title: "Booking failed",
        message: "Failed to create booking. Please try again.",
        timestamp: Date.now(),
      });
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
        <div className="text-sm bg-blue-50 px-3 py-1 rounded-full">
          <span className="font-medium">{activeUsers}</span> active{" "}
          {activeUsers === 1 ? "user" : "users"}
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <Alert
          className={`mb-4 ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <AlertDescription>
            <div className="font-medium">{notification.title}</div>
            <div>{notification.message}</div>
          </AlertDescription>
        </Alert>
      )}

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
                          <br />
                          <span className="text-xs text-gray-600">
                            {categoryInfo[seat.categoryId]?.name || "Unknown"}
                            {seat.subcategoryId &&
                            categoryInfo[seat.categoryId]?.subcategories[
                              seat.subcategoryId
                            ]
                              ? ` - ${categoryInfo[seat.categoryId].subcategories[seat.subcategoryId].name}`
                              : ""}
                          </span>
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

          {/* Inside the Card component that renders the seat legend */}
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
                  <div className="w-4 h-4 bg-gray-400 border-2 border-blue-500 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-sm">Reserved by others</span>
                </div>

                {/* Display categories and subcategories */}
                {venue.event && venue.event.categories && (
                  <div className="mt-4 space-y-2">
                    <Label className="font-medium">Categories:</Label>
                    <div className="space-y-3 mt-2">
                      {venue.event.categories.map((category) => (
                        <div key={category._id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    venue.categoryColors[category._id],
                                }}
                              ></div>
                              <span className="font-medium">
                                {category.name}
                              </span>
                            </div>
                            <Badge>
                              {category.price !== undefined &&
                              category.price !== null
                                ? `$${category.price.toFixed(2)}`
                                : "Varies"}
                            </Badge>
                          </div>

                          {/* Render subcategories - Fixed to properly display subcategory name */}
                          {category.subcategories &&
                            category.subcategories.length > 0 && (
                              <div className="ml-5 space-y-1 mt-1">
                                {category.subcategories.map((subcategory) => {
                                  // Safely get price with fallbacks
                                  const subPrice =
                                    subcategory.price !== undefined &&
                                    subcategory.price !== null
                                      ? subcategory.price
                                      : category.price !== undefined &&
                                          category.price !== null
                                        ? category.price
                                        : 0;

                                  return (
                                    <div
                                      key={subcategory._id}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              venue.subcategoryColors[
                                                subcategory._id
                                              ],
                                          }}
                                        ></div>
                                        <span>{subcategory.name}</span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        ${subPrice.toFixed(2)}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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
              <Alert className="mb-4">
                <AlertDescription className="text-sm">
                  <strong>Live booking in progress.</strong> Seats may be
                  temporarily reserved by other users. You'll see real-time
                  updates as seats are selected or booked.
                </AlertDescription>
              </Alert>

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
                        const isTempReserved =
                          tempReservedSeats[seatId] &&
                          tempReservedSeats[seatId].userId !==
                            socketRef.current?.id;
                        const isBookable =
                          seat.categoryId &&
                          seat.status === "available" &&
                          !isTempReserved;

                        return (
                          <TooltipProvider key={colIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`
                                    w-6 h-6 rounded-sm
                                    ${isSelected ? "border-2 border-blue-500" : seat.categoryId ? "border border-gray-300" : ""}
                                    ${isBookable ? "cursor-pointer hover:opacity-80" : seat.categoryId ? "cursor-not-allowed opacity-70" : ""}
                                    ${isTempReserved ? "animate-pulse" : ""}
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
                                  {getSeatCategoryName(seat)}
                                </div>
                                <div className="text-xs">
                                  Row {rowIndex + 1}, Seat {colIndex + 1}
                                </div>
                                <div className="text-xs mt-1">
                                  Status: {getSeatStatus(seatWithPos)}
                                </div>
                                {seat.categoryId &&
                                  seat.status === "available" &&
                                  !isTempReserved && (
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
                <p className="text-sm text-blue-800 mt-1">
                  Seats are held for 5 minutes while you complete your booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
