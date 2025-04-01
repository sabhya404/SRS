"use client";

import { useState } from "react";

const Description = ({ description, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-2/3 bg-white p-4 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-2">Event Description</h2>
      <p className="text-gray-700">
        {isExpanded ? description : `${description.slice(0, maxLength)}...`}
      </p>
      {description.length > maxLength && (
        <button
          onClick={toggleDescription}
          className="mt-2 text-blue-600 hover:underline font-medium"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default Description;
