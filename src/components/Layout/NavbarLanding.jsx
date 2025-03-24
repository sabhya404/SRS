"use client";
import axios from "axios";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import LoginComponent from "../authComponent/Login/LoginComponent";
import RegisterForm from "../authComponent/Register/RegisterForm";

const NavbarLanding = () => {
  const router = useRouter();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [openMobileSubMenu, setOpenMobileSubMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  // Register state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // const toggleMobileSubmenu = (index) => {
  //   setOpenMobileSubMenu(openMobileSubMenu === index ? null : index);
  // };

  // Form validation for login
  const validateForm = () => {
    let isValid = true;
    const errors = { email: "", password: "" };
    //email validation
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }
    //password validation
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      //route connection
      const response = await axios.post("/api/auth/login", { email, password });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success("Login successful!");
        router.push("/HomePage");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Handle register form input changes
  const handleChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle register form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account created successfully!");
      setIsRegisterView(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle switching between login and register views
  const handleOpenLogin = () => {
    setOpenLoginModal(true);
    setIsRegisterView(false);
  };

  const handleOpenRegister = () => {
    setIsRegisterView(true);
    setOpenLoginModal(false);
  };

  return (
    <div className="sticky top-0 w-full flex justify-center z-50">
      <nav className="w-full bg-white shadow-md py-1 px-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* mobileview */}
            {/* <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#646ecb] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#646ecb]"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div> */}

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleOpenLogin}
                className="px-4 py-2 text-md text-[#646ecb] border border-[#646ecb] rounded-xl hover:bg-blue-50 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={handleOpenRegister}
                className="px-4 py-2 text-md text-white bg-[#646ecb] border border-[#646ecb] rounded-xl hover:bg-[#646ecb] cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* props for login components */}
      {openLoginModal && (
        <LoginComponent
          onClose={() => setOpenLoginModal(false)}
          email={email}
          password={password}
          loading={loading}
          formErrors={formErrors}
          setEmail={setEmail}
          setPassword={setPassword}
          handleLogin={handleLogin}
          validateForm={validateForm}
          onRegisterClick={handleOpenRegister}
        />
      )}
      {/* props for register */}
      {isRegisterView && (
        <RegisterForm
          onClose={() => setIsRegisterView(false)}
          user={user}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          loading={loading}
          onLoginClick={handleOpenLogin}
        />
      )}
    </div>
  );
};

export default NavbarLanding;
