"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "react-qr-code";
import dynamic from "next/dynamic";

// Load html2canvas for client-side only
const Html2Canvas = dynamic(() => import("html2canvas"), { ssr: false });

export default function TicketPage({ params }) {
  const { bookingNumber } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ticketRef = useRef(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const localBooking = localStorage.getItem("confirmedBooking");
        if (localBooking) {
          const parsed = JSON.parse(localBooking);
          if (parsed.bookingNumber === bookingNumber) {
            setBooking(parsed);
            setLoading(false);
            return;
          }
        }
        const { data } = await axios.get(
          `/api/bookings?bookingNumber=${bookingNumber}`
        );
        if (data.success) setBooking(data.booking);
        else throw new Error("Failed to fetch booking");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load ticket");
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingNumber]);

  const downloadQRCode = async (seat, index) => {
    setDownloadingIndex(index);
    try {
      const svg = document.getElementById(`qr-${index}`);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
      await new Promise((res) => (img.onload = res));
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `QR-${booking.bookingNumber}-Row${seat.row + 1}-Col${seat.col + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadAllPNGs = async () => {
    if (!ticketRef.current) return;
    setDownloadingAll(true);
    try {
      const svgElements = ticketRef.current.querySelectorAll("svg.qr-code");
      for (let i = 0; i < svgElements.length; i++) {
        const svg = svgElements[i];
        const seat = booking.seats[i];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.src =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => (img.onload = res));
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `QR-${booking.bookingNumber}-Row${seat.row + 1}-Col${seat.col + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading)
    return (
      <div className="container mx-auto py-12 text-center">
        Loading Tickets...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  if (!booking)
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>No ticket information was found.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Browse Events</Button>
      </div>
    );

  const seats = Array.isArray(booking.seats) ? booking.seats : [];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
          Booking reference:{" "}
          <span className="font-medium">{booking.bookingNumber}</span>
        </p>
      </div>

      {/* Download All QR Button */}
      {seats.length > 0 && (
        <div className="mb-6 flex justify-center">
          <Button
            onClick={downloadAllPNGs}
            disabled={downloadingAll}
            className="w-full sm:w-auto px-6"
          >
            {downloadingAll
              ? "Downloading All..."
              : "Download All QR Images (PNG)"}
          </Button>
        </div>
      )}

      <div className="space-y-8" ref={ticketRef}>
        {seats.map((seat, index) => (
          <div key={index} className="ticket-container">
            <Card className="border-2 border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <div className="sm:col-span-2 p-6 border-r border-dashed border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {booking.event?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.event?.startDate &&
                          new Date(booking.event.startDate).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                        {booking.event?.location?.address ||
                          "Address not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Seat</p>
                      <p className="text-sm font-medium">
                        Row {seat.row + 1}, Seat {seat.col + 1}
                      </p>
                      <p className="text-xs text-gray-600">
                        {seat.categoryName}
                        {seat.subcategoryName
                          ? ` - ${seat.subcategoryName}`
                          : ""}
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

                <div className="flex flex-col items-center justify-center p-6 bg-gray-50">
                  <div className="mb-2">
                    <QRCode
                      className="qr-code"
                      id={`qr-${index}`}
                      value={`${booking.bookingNumber}-${seat.row}-${seat.col}`}
                      size={120}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode(seat, index)}
                    disabled={downloadingIndex === index}
                  >
                    {downloadingIndex === index
                      ? "Downloading..."
                      : "Download QR"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-md border border-blue-200 text-sm text-blue-800">
        <h3 className="font-medium text-lg mb-3">Important Information</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Please arrive 30 minutes before the event starts</li>
          <li>Each ticket is valid for one person only</li>
          <li>You may be required to show ID matching the booking name</li>
          <li>
            These tickets have been emailed to{" "}
            {booking.customer?.email || "your email address"}
          </li>
        </ul>
        <div className="mt-4">
          <p>
            For any questions or assistance, contact support with your booking
            reference: <strong>{booking.bookingNumber}</strong>
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push(`/events/${booking.eventId}`)}
        >
          View Event Details
        </Button>
        <Button onClick={() => router.push("/")}>Browse More Events</Button>
      </div>
    </div>
  );
}
