"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [countdown, setCountdown] = useState(null);
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Load booking data from localStorage and pre-fill user data from session
  useEffect(() => {
    try {
      // Get booking data from localStorage
      const savedBooking = localStorage.getItem("pendingBooking");
      
      if (!savedBooking) {
        setError("No booking information found. Please select seats first.");
        setLoading(false);
        return;
      }
      
      const bookingData = JSON.parse(savedBooking);
      
      // Check if booking is expired
      if (bookingData.expiry < Date.now()) {
        setError("Your seat reservation has expired. Please select seats again.");
        localStorage.removeItem("pendingBooking");
        setLoading(false);
        return;
      }
      
      setBooking(bookingData);
      
      // Once we have a session, set the user data
      if (status === "authenticated" && session?.user) {
        console.log("User data from session:", session.user);
        setFormData(prev => ({
          ...prev,
          name: session.user.name || prev.name,
          email: session.user.email || prev.email,
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading booking data:", err);
      setError("Failed to load booking information. Please try again.");
      setLoading(false);
    }
  }, [session, status]);

  // Countdown timer for seat reservation expiry
  useEffect(() => {
    if (!booking) return;
    
    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = booking.expiry - now;
      
      if (timeLeft <= 0) {
        setError("Your seat reservation has expired. Please select seats again.");
        localStorage.removeItem("pendingBooking");
        setCountdown(null);
        return;
      }
      
      // Format as MM:SS
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [booking]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!booking) return;
    
    try {
      setProcessing(true);
      setNotification({
        type: "info",
        title: "Processing",
        message: "Processing your payment and confirming your seats...",
      });
      
      // Prepare the booking data to send to the API
      const apiBookingData = {
        eventId: booking.eventId,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        customer: formData,
        userId: session?.user?.id || null
      };
      
      // Call the API to save the booking
      const response = await axios.post('/api/bookings', apiBookingData);
      
      if (response.data.success) {
        // Clear the pending booking from localStorage
        localStorage.removeItem("pendingBooking");
        
        // Store confirmed booking reference for ticket page
        localStorage.setItem("confirmedBooking", JSON.stringify({
          ...booking,
          customer: formData,
          userId: session?.user?.id || null,
          bookingNumber: response.data.booking.bookingNumber,
          bookingId: response.data.booking.id,
          confirmationDate: new Date().toISOString()
        }));
        
        // Show success notification
        setNotification({
          type: "success",
          title: "Booking Confirmed",
          message: "Your payment was successful. Redirecting to your tickets...",
        });
        
        // Redirect to ticket page with booking ID
        setTimeout(() => {
          router.push(`/tickets/${response.data.booking.bookingNumber}`);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Payment/booking error:", error);
      setNotification({
        type: "error",
        title: "Booking Failed",
        message: error.response?.data?.message || error.message || "There was an error processing your booking. Please try again.",
      });
      setProcessing(false);
    }
  };

  // Cancel booking and return to event page
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking? Your seat selection will be lost.")) {
      localStorage.removeItem("pendingBooking");
      router.push(`/events/${booking?.eventId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Checkout...</h2>
          <p>Please wait while we prepare your booking.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push(`/events/${booking?.eventId || ''}`)}>
            Return to Event
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>No Booking Found</AlertTitle>
          <AlertDescription>
            No booking information was found. Please select your seats first.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Booking</h1>
        <p className="text-gray-500 mt-2">
          Please complete payment within <span className="font-medium text-red-500">{countdown}</span> before your seats are released
        </p>
      </div>

      {/* Authentication Status */}
      {status === "unauthenticated" && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <AlertTitle>Guest Checkout</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>You're not signed in. </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white" 
              onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent('/checkout')}`)}
            >
              Sign in for faster checkout
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Notification */}
      {notification && (
        <Alert
          className={`mb-6 ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <AlertTitle>{notification.title}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary Card */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Event: {booking.event?.title || "Ticket Booking"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {new Date(booking.event?.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {booking.event?.startDate && ' at '}
                  {new Date(booking.event?.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.event?.location?.address}, {booking.event?.location?.city}
                </p>
              </div>
              
              {/* Seat List */}
              <div>
                <h3 className="font-medium mb-2">Selected Seats ({booking.seats.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {booking.seats.map((seat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                    >
                      <span>
                        Row {seat.row + 1}, Seat {seat.col + 1}
                        <br />
                        <span className="text-xs text-gray-600">
                          {seat.categoryName}
                          {seat.subcategoryName ? ` - ${seat.subcategoryName}` : ""}
                        </span>
                      </span>
                      <span>${seat.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${(booking.totalPrice * 0.05).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(booking.totalPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Policy */}
          <div className="mt-4 bg-gray-50 p-4 rounded text-sm">
            <h4 className="font-medium mb-2">Booking Policy</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Seats are reserved for 15 minutes during checkout</li>
              <li>Tickets cannot be refunded after purchase</li>
              <li>You will receive e-tickets via email</li>
            </ul>
          </div>
        </div>
        
        {/* Payment Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your details to complete the booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={processing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={processing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (123) 456-7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-[200px]"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Complete Payment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}