"use client";
import { useState, useEffect } from "react";

const DateCounter = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = new Date(targetDate) - now;

    if (difference <= 0) return { months: 0, days: 0, hours: 0, minutes: 0 };

    const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { months, days, hours, minutes };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center space-x-4 bg-blue-200 p-6 rounded-xl">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <div key={index} className="relative w-30 h-30  text-center">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              stroke="rgba(255,255,255,0.2)"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              stroke={["#ff007f", "#ffcc00", "#ff6600", "#ff3300"][index]} // Different colors for each unit
              strokeDasharray="251.2"
              strokeDashoffset={
                251.2 -
                (value / (unit === "months" ? 12 : unit === "days" ? 30 : 60)) *
                  251.2
              }
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-lg">
            {String(value).padStart(2, "0")}
            <span className="text-xs font-light">
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DateCounter;
