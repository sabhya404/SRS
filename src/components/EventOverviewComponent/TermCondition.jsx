"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TermsConditions = ({ terms }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-2/3 bg-white rounded-lg shadow-md">
      <button
        className="w-full flex justify-between items-center p-4 text-gray-900 font-semibold border border-gray-300 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        Terms & Conditions
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="p-4 text-gray-700 border-t border-gray-300">
          <p>{terms}</p>
        </div>
      )}
    </div>
  );
};

export default TermsConditions;
