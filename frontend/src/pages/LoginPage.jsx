import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData);
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center p-6 sm:p-12"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2">
              {/* Static Logo */}
              <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-md">
                <MessageSquare className="size-6 text-blue-600" />
              </div>

              <h1 className="text-2xl font-bold mt-2 text-gray-800">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Email
                </span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center justify-start focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  autoFocus
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Password
                </span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center justify-start focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex items-center p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
              disabled={isLoggingIn}
            >
              {isLoggingIn && <Loader2 className="size-5 animate-spin" />}
              <span>{isLoggingIn ? "Signing in..." : "Sign In"}</span>
            </button>
          </motion.form>

          {/* Signup Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AuthImagePattern
          title="Welcome back"
          subtitle="Sign in to continue your conversations and catch up with your messages"
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;
