// File: VerifyEmailStep.tsx
import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

function VerifyEmailStep({
  newUser,
  handleExtendedChange,
  sendVerificationCode,
  loading,
  prevStep,
  OTPtoken,
  onClose,
  onLoginClick,
}) {
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const verify = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/auth/verify", {
        OTPtoken: OTPtoken,
        verifyCode: newUser.verificationCode,
      });
      // console.log("check verify");
      if (response.status === 200) {
        setMessage("Verification Successfull!");
        setTimeout(() => {
          onClose(); // Close registration modal
          onLoginClick(); // Redirect to login page
        }, 2000);
      } else {
        setMessage(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Network error. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Verify Your Email</h3>
      {message && (
        <div
          className={`p-3 rounded-md mb-4 ${
            message.includes("complete")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={verify} className="space-y-4">
        <div className="text-center mb-4">
          <p className="mb-4">We have sent a verification code to:</p>
          <p className="font-semibold text-lg">{newUser.email}</p>
        </div>

        <div className="flex justify-center mb-4">
          <input
            type="text"
            name="verificationCode"
            placeholder="Enter Verification Code"
            value={newUser.verificationCode}
            onChange={handleExtendedChange}
            required
            className="w-full max-w-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb] text-center text-lg tracking-widest"
          />
        </div>

        <div className="text-center mb-4">
          <button
            type="button"
            onClick={sendVerificationCode}
            className="text-[#646ecb] hover:underline"
          >
            Resend Code
          </button>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="w-1/3 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/3 bg-[#646ecb] text-white py-2 rounded-md font-medium hover:bg-[#4d59c6] transition duration-200 flex items-center justify-center"
          >
            <span>Verify</span>
            <CheckCircle2 size={18} className="ml-2" />
          </button>
        </div>
      </form>
    </>
  );
}
import axios from "axios";

export default VerifyEmailStep;
