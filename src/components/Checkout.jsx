"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Form setup
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  // Parse booking data from URL or get from local storage
  useEffect(() => {
    try {
      // Try to get booking data from URL first
      const bookingParam = searchParams.get("booking");

      if (bookingParam) {
        const parsedBooking = JSON.parse(decodeURIComponent(bookingParam));
        setBooking(parsedBooking);
        setLoading(false);

        // Save to localStorage as backup
        localStorage.setItem("currentBooking", JSON.stringify(parsedBooking));
      } else {
        // If not in URL, try localStorage
        const storedBooking = localStorage.getItem("currentBooking");
        if (storedBooking) {
          setBooking(JSON.parse(storedBooking));
          setLoading(false);
        } else {
          throw new Error("No booking information found");
        }
      }
    } catch (err) {
      console.error("Error loading booking data:", err);
      setError(
        "Failed to load booking information. Please go back and try again."
      );
      setLoading(false);
    }
  }, [searchParams]);

  // Countdown timer for booking expiration
  useEffect(() => {
    if (!booking) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setNotification({
            type: "error",
            message:
              "Your booking time has expired. Please select seats again.",
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!booking) return;

    setProcessing(true);

    try {
      // Format the complete checkout data
      const checkoutData = {
        ...booking,
        customer: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        },
      };

      // Send to API
      const response = await axios.post("/api/bookings/create", checkoutData);

      if (response.data.success) {
        // Clear booking from localStorage
        localStorage.removeItem("currentBooking");

        // Show success notification
        setNotification({
          type: "success",
          message:
            "Booking successful! Redirecting to your booking confirmation...",
        });

        // Redirect to confirmation page after short delay
        setTimeout(() => {
          router.push(`/bookings/${response.data.bookingId}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setNotification({
        type: "error",
        message:
          err.response?.data?.message ||
          "Booking processing failed. Please try again.",
      });
      setProcessing(false);
    }
  };

  // Go back to seat selection
  const goBackToSeats = () => {
    router.push(`/events/${booking?.eventId}/tickets`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading checkout...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertDescription>
            <div className="font-medium">Error</div>
            <div>{error}</div>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!booking || !booking.seats || booking.seats.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>
            <div className="font-medium">No seats selected</div>
            <div>Please select seats before proceeding to checkout.</div>
            <Button className="mt-4" onClick={() => router.back()}>
              Select Seats
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complete Your Booking</h1>
        <div className="text-sm bg-blue-50 px-3 py-1 rounded-full">
          <span className="font-medium">
            Time remaining: {formatTimeLeft()}
          </span>
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <Alert
          className={`mb-4 ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide your contact details to complete the booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email address",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ required: "Phone number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requirements or notes for your booking"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBackToSeats}
                    >
                      Back to Seats
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing || timeLeft <= 0}
                    >
                      {processing ? "Processing..." : "Complete Booking"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Selected Seats</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {booking.seats.map((seat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                    >
                      <span>
                        Row {seat.row + 1}, Seat {seat.col + 1}
                      </span>
                      <span>${seat.price?.toFixed(2) || "0.00"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Price:</span>
                  <span>${booking.totalPrice?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center">
                <p className="text-sm text-gray-500">
                  By completing this booking, you agree to our terms and
                  conditions.
                </p>
              </div>
            </CardFooter>
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
                <h3 className="font-medium text-blue-900">Important</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Your seats are reserved for {Math.floor(timeLeft / 60)}{" "}
                  minutes and {timeLeft % 60} seconds. Please complete your
                  booking before the timer expires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
