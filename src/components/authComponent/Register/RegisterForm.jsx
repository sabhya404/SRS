// File: RegisterForm.jsx (Main container)
"use client";

import React, { useState } from "react";
import Stepper from "../../ui/stepper";
import RegistrationStep from "./RegistrationStep";
import VerifyEmailStep from "./VerifyEmailStep";
import { X } from "lucide-react";

const RegisterForm = ({
  user,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  onLoginClick,
  onClose,
}) => {
  // Track the current step
  const [currentStep, setCurrentStep] = useState(1);
  const [OTPtoken, setOTPtoken] = useState("");

  // Local state for form data
  const [newUser, setNewUser] = useState({
    ...user,
    verificationCode: "",
  });

  // Handle changes for input fields
  const handleExtendedChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If the field exists in the base user object, update it via handleChange
    if (name in user) {
      handleChange(e);
    }
  };

  // Function to navigate to next step
  const nextStep = (token) => {
    console.log("terui maa ka bho sada ");

    setOTPtoken(token);
    console.log(`lala lund ${currentStep}`);
    setCurrentStep(2);
  };

  // Function to navigate to previous step
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Mock function to send verification code
  const sendVerificationCode = () => {
    alert(`Verification code sent to: ${newUser.email}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg md:px-24 px-3 py-10 w-full max-w-3xl relative"
      >
        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h1 className="text-2xl font-bold text-center mb-2">
          Book Ticket through
        </h1>
        <h2 className="text-3xl font-bold text-center mb-8">SRS</h2>

        {/* Stepper Component */}
        <Stepper currentStep={currentStep} />

        {/* Step 1: Basic Registration */}
        {currentStep === 1 && (
          <RegistrationStep
            newUser={newUser}
            handleExtendedChange={handleExtendedChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            loading={loading}
            nextStep={nextStep}
            onLoginClick={onLoginClick}
          />
        )}

        {/* Step 2: Email Verification */}
        {currentStep === 2 && (
          <VerifyEmailStep
            newUser={newUser}
            handleExtendedChange={handleExtendedChange}
            sendVerificationCode={sendVerificationCode}
            loading={loading}
            prevStep={prevStep}
            OTPtoken={OTPtoken}
            onClose={onClose}
            onLoginClick={onLoginClick}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
