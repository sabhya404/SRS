"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, ArrowRight, LogOut, Ticket } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Main landing page component
export default function LandingPage() {
  const [isHoveringBrowse, setIsHoveringBrowse] = useState(false);
  const [isHoveringOrganize, setIsHoveringOrganize] = useState(false);
  const [latestTicket, setLatestTicket] = useState(null);
  const router = useRouter();

  // Handle logout function
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Fetch user's latest ticket on component mount
  useEffect(() => {
    const fetchLatestTicket = async () => {
      try {
        const response = await fetch("/api/user/tickets/latest");
        if (response.ok) {
          const data = await response.json();
          setLatestTicket(data);
        }
      } catch (error) {
        console.error("Error fetching latest ticket:", error);
      }
    };

    fetchLatestTicket();
  }, []);

  // Handle ticket button click - redirect to specific ticket route
  const handleTicketClick = (e) => {
    e.preventDefault();

    // If we have the latest ticket, use its booking number, otherwise redirect to tickets list
    if (latestTicket && latestTicket.bookingNumber) {
      router.push(`/tickets/${latestTicket.bookingNumber}`);
    } else {
      router.push("/tickets");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold">SRS</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/eventList"
              className="hover:text-indigo-600 transition-colors border-b-4 rounded-lg border-indigo-300 hover:border-indigo-100 px-4 py-2"
            >
              Browse Events
            </Link>
            <Link
              href="/create-event"
              className="hover:text-indigo-600 transition-colors border-b-4 rounded-lg border-indigo-300 hover:border-indigo-100 px-4 py-2"
            >
              Organize Event
            </Link>
            {/* Modified My Tickets link with onClick handler */}
            <a
              href="/tickets"
              onClick={handleTicketClick}
              className="hover:text-indigo-600 transition-colors border-b-4 rounded-lg border-indigo-300 hover:border-indigo-100 px-4 py-2 flex items-center cursor-pointer"
            >
              <Ticket className="h-4 w-4 mr-1" />
              My Tickets
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Book Your Perfect Seat
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-600">
          Find and reserve seats for your favorite events or create and manage
          your own events with ease.
        </p>

        {/* Main Call to Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Browse Events Card */}
          <Link
            href="/eventList"
            onMouseEnter={() => setIsHoveringBrowse(true)}
            onMouseLeave={() => setIsHoveringBrowse(false)}
            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-100"
          >
            <div className="bg-indigo-50 p-4 rounded-full mb-6">
              <Calendar className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Browse Events</h2>
            <p className="text-gray-600 mb-6">
              Discover and book seats for concerts, conferences, sports games,
              and more.
            </p>
            <div
              className={`flex items-center text-indigo-600 font-medium ${isHoveringBrowse ? "translate-x-2" : ""} transition-transform duration-300`}
            >
              Explore events <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>

          {/* Organize Event Card */}
          <Link
            href="/create-event"
            onMouseEnter={() => setIsHoveringOrganize(true)}
            onMouseLeave={() => setIsHoveringOrganize(false)}
            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-100"
          >
            <div className="bg-indigo-50 p-4 rounded-full mb-6">
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Organize an Event</h2>
            <p className="text-gray-600 mb-6">
              Create your own event, manage seating layouts, and sell tickets
              with ease.
            </p>
            <div
              className={`flex items-center text-indigo-600 font-medium ${isHoveringOrganize ? "translate-x-2" : ""} transition-transform duration-300`}
            >
              Create now <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose SRS?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-50 p-4 rounded-full inline-flex mb-4">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Select your preferred seats with our intuitive seat selection
                system.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-50 p-4 rounded-full inline-flex mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible Layout</h3>
              <p className="text-gray-600">
                Create custom seating arrangements for any type of venue or
                event.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-50 p-4 rounded-full inline-flex mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                See seat availability instantly with real-time booking
                information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect For Any Event
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Concerts",
              "Conferences",
              "Sports",
              "Theaters",
              "Workshops",
              "Seminars",
              "Meetings",
              "Parties",
            ].map((event, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
              >
                <p className="font-medium">{event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event organizers and attendees today.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/eventList"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/create-event"
              className="bg-indigo-700 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors"
            >
              Organize an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold text-white">SRS</span>
              </div>
              <p className="max-w-xs">
                Book seats for any event or create and manage your own events
                with our simple platform.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Updates
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} SRS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
