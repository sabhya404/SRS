"use client";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";

const LoginComponent = ({
  email,
  password,
  loading,
  formErrors = {},
  setEmail,
  setPassword,
  handleLogin,
  onRegisterClick,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        // stop parent triggering
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-8 w-full max-w-md relative"
      >
        {/* Cancel button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h1 className="text-2xl font-bold text-center mb-2">Welcome back to</h1>
        <h2 className="text-3xl font-bold text-center mb-8 text-[#4B3F2F]">
          SRS
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#646ecb]"
              placeholder="Enter your password"
            />
            {formErrors.password && (
              <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          <button
            onClick={() => {
              signIn("credentials", { email, password });
            }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#646ecb] text-white py-2 rounded-md font-medium hover:bg-[#646ecb] transition duration-200"
          >
            {loading ? "Signing in..." : "LOGIN"}
          </button>

          <div className="text-right">
            <a href="#" className="text-sm text-[#616ccc] hover:underline">
              Forgot Password?
            </a>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-[#646ecb] hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
