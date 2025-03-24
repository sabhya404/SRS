// File: RegistrationStep.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

function RegistrationStep({
  newUser,
  handleExtendedChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  nextStep,
  onLoginClick,
}) {
  const [message, setMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    //igc
    if (newUser.password !== newUser.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post("/api/auth/register", {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      });

      if (response.status === 201) {
        setMessage("Registration successful!");
        console.log("going to the next step");
        nextStep(response.data.OTPtoken);
      } else {
        setMessage(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Network error. Try again.");
    }
  };
  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Create Account</h3>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="username"
          value={newUser.username}
          onChange={handleExtendedChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleExtendedChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={newUser.password}
              onChange={handleExtendedChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={newUser.confirmPassword}
              onChange={handleExtendedChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={loading}
            className="w-1/2 max-w-xs bg-[#646ecb] text-white py-2 rounded-md font-medium hover:bg-[#4f5ac3] transition duration-200"
          >
            Next
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an Account?{" "}
          <button
            onClick={onLoginClick}
            className="text-[#646ecb] hover:underline"
          >
            <span>Login</span>
          </button>
        </p>
      </div>
    </>
  );
}

export default RegistrationStep;
