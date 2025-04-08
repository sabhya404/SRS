"use client";
import { Calendar, Clock, MapPin, Users, Check } from "lucide-react";

export const Stepper = ({ activeStep }) => {
  const steps = [
    { number: 1, label: "Basics", icon: <Calendar size={16} /> },
    { number: 2, label: "Location", icon: <MapPin size={16} /> },
    { number: 3, label: "Seating", icon: <Users size={16} /> },
    { number: 4, label: "Review", icon: <Check size={16} /> },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`flex flex-col items-center ${
              index < activeStep - 1
                ? "text-green-600"
                : index === activeStep - 1
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                index < activeStep - 1
                  ? "bg-green-100 text-green-600 border-2 border-green-600"
                  : index === activeStep - 1
                    ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-300"
              }`}
            >
              {index < activeStep - 1 ? <Check size={20} /> : step.number}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
