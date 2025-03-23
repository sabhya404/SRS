// File: Stepper.js
import React from "react";

const Stepper = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? "bg-[#646ecb] text-white" : "bg-gray-200"}`}
          >
            1
          </div>
          <span className="mt-2 text-sm">Registration</span>
        </div>

        {/* <div
          className={`flex-1 h-1 mx-2 mb-8 ${currentStep >= 2 ? "bg-[#646ecb]" : "bg-gray-200"}`}
        ></div> */}

        <div
          className={`flex-1 h-1 mx-2 mb-8 ${currentStep >= 2 ? "bg-[#646ecb]" : "bg-gray-200"}`}
        ></div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? "bg-[#646ecb] text-white" : "bg-gray-200"}`}
          >
            2
          </div>
          <span className="mt-2 text-sm">Verify Email</span>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
