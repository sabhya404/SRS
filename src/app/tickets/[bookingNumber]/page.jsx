"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
// Import QRCode as a default import
import QRCode from 'react-qr-code';
import dynamic from "next/dynamic";

// Dynamically import html2canvas and jsPDF with no SSR
const Html2Canvas = dynamic(() => import('html2canvas'), { ssr: false });
const JsPDF = dynamic(() => import('jspdf').then(mod => mod.jsPDF), { ssr: false });

export default function TicketPage({ params }) {
  const { bookingNumber } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ticketRef = useRef(null);
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Fetch booking data from localStorage or API
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // First check localStorage for just-completed booking
        const localBooking = localStorage.getItem("confirmedBooking");
        
        if (localBooking) {
          const parsedBooking = JSON.parse(localBooking);
          
          // Use localStorage data if it matches the current booking number
          if (parsedBooking.bookingNumber === bookingNumber) {
            setBooking(parsedBooking);
            setLoading(false);
            setPdfReady(true);
            return;
          }
        }
        
        // If not found in localStorage, fetch from API
        try {
          const response = await axios.get(`/api/bookings?bookingNumber=${bookingNumber}`);
          
          if (response.data.success) {
            setBooking(response.data.booking);
            setPdfReady(true);
          } else {
            throw new Error("Failed to fetch booking details");
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          // If API fails but we had a local booking, use that as fallback
          if (localBooking) {
            const parsedBooking = JSON.parse(localBooking);
            setBooking(parsedBooking);
            setPdfReady(true);
          } else {
            throw new Error("Failed to fetch booking details");
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading ticket:", err);
        setError(err.response?.data?.message || "Failed to load ticket details");
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingNumber]);

  // Function to download individual ticket
  const downloadTicket = async (seat, index) => {
    if (!ticketRef.current || !pdfReady) return;
    
    try {
      setDownloadingTicket(true);
      
      const ticketElement = ticketRef.current.children[index];
      
      const canvas = await Html2Canvas(ticketElement, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [210, 100]
      });
      
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 80);
      pdf.save(`Ticket-${booking.bookingNumber}-Seat-R${seat.row + 1}C${seat.col + 1}.pdf`);
    } catch (error) {
      console.error("Error downloading ticket:", error);
    } finally {
      setDownloadingTicket(false);
    }
  };

  // Function to download all tickets
  const downloadAllTickets = async () => {
    if (!ticketRef.current || !booking?.seats?.length || !pdfReady) return;
    
    setDownloadingTicket(true);
    
    try {
      const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [210, 100]
      });
      
      for (let i = 0; i < booking.seats.length; i++) {
        const ticketElement = ticketRef.current.children[i];
        
        const canvas = await Html2Canvas(ticketElement, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 80);
      }
      
      pdf.save(`Tickets-${booking.bookingNumber}.pdf`);
    } catch (error) {
      console.error("Error downloading tickets:", error);
    } finally {
      setDownloadingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Tickets...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="mb-6">
          <AlertDescription>
            No ticket information was found. Please check your booking reference.
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

  // Make sure booking.seats exists and is an array before mapping
  const seats = Array.isArray(booking.seats) ? booking.seats : [];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Tickets</h1>
          <p className="mt-2 text-gray-600">
            Booking reference: <span className="font-medium">{booking.bookingNumber}</span>
          </p>
        </div>

        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{booking.event?.title || "Event Booking"}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.event?.startDate && new Date(booking.event.startDate).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.event?.location ? `${booking.event.location.address}, ${booking.event.location.city}` : "Venue details not available"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Download All Tickets Button */}
        {seats.length > 0 && (
          <div className="mb-6 flex justify-center">
            <Button 
              className="w-full sm:w-auto px-6" 
              onClick={downloadAllTickets}
              disabled={downloadingTicket || !pdfReady}
            >
              {downloadingTicket ? "Preparing Download..." : "Download All Tickets (PDF)"}
            </Button>
          </div>
        )}

        {/* Individual Tickets */}
        <div className="space-y-8" ref={ticketRef}>
          {seats.length > 0 ? (
            seats.map((seat, index) => (
              <div key={index} className="ticket-container">
                <Card className="border-2 border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-3">
                    {/* Event Info */}
                    <div className="sm:col-span-2 p-6 border-r border-dashed border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{booking.event?.title || "Event Ticket"}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.event?.startDate && new Date(booking.event.startDate).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          Valid
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Venue</p>
                          <p className="text-sm font-medium">
                            {booking.event?.location?.address || "Address not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Seat</p>
                          <p className="text-sm font-medium">
                            Row {seat.row + 1}, Seat {seat.col + 1}
                          </p>
                          <p className="text-xs text-gray-600">
                            {seat.categoryName}
                            {seat.subcategoryName ? ` - ${seat.subcategoryName}` : ""}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Attendee</p>
                          <p className="text-sm font-medium">
                            {booking.customer?.name || "Guest"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Booking Ref</p>
                          <p className="text-sm font-medium">
                            {booking.bookingNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50">
                      <div className="mb-2">
                        {pdfReady && (
                          <QRCode
                            value={`${booking.bookingNumber}-${seat.row}-${seat.col}`}
                            size={120}
                          />
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => downloadTicket(seat, index)}
                        disabled={downloadingTicket || !pdfReady}
                      >
                        {downloadingTicket ? "Downloading..." : "Download Ticket"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <p>No seat details available for this booking.</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 p-6 rounded-md border border-blue-200 text-sm text-blue-800">
          <h3 className="font-medium text-lg mb-3">Important Information</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Please arrive 30 minutes before the event starts</li>
            <li>Each ticket is valid for one person only</li>
            <li>You may be required to show ID matching the booking name</li>
            <li>These tickets have been emailed to {booking.customer?.email || "your email address"}</li>
          </ul>
          
          <div className="mt-4">
            <p>For any questions or assistance, please contact support with your booking reference: <strong>{booking.bookingNumber}</strong></p>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="sm:w-auto" 
            onClick={() => router.push(`/events/${booking.eventId}`)}
          >
            View Event Details
          </Button>
          <Button 
            className="sm:w-auto"
            onClick={() => router.push('/')}
          >
            Browse More Events
          </Button>
        </div>
      </div>
    </div>
  );
}