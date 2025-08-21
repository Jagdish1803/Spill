import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error("Full name is required");
    if (formData.fullname.trim().length < 2) return toast.error("Full name must be at least 2 characters");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signup(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <div className="flex flex-col items-center gap-2 group">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="size-12 rounded-xl bg-blue-100 flex items-center justify-center"
              >
                <MessageSquare className="size-6 text-blue-600" />
              </motion.div>
              <h1 className="text-2xl font-bold mt-2 text-gray-800">Create Account</h1>
              <p className="text-gray-600">Get started with your free account</p>
            </div>
          </motion.div>

          <motion.form onSubmit={handleSubmit} className="space-y-6">
            {/* Fullname */}
            <motion.div className="form-control" variants={fadeInUp}>
              <label className="label">
                <span className="label-text font-medium text-gray-700">Full Name</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  placeholder="John Doe"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  disabled={isSigningUp}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div className="form-control" variants={fadeInUp}>
              <label className="label">
                <span className="label-text font-medium text-gray-700">Email</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSigningUp}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div className="form-control" variants={fadeInUp}>
              <label className="label">
                <span className="label-text font-medium text-gray-700">Password</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  className="flex items-center p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeInUp}>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
                disabled={isSigningUp}
              >
                {isSigningUp && <Loader2 className="size-5 animate-spin" />}
                <span>{isSigningUp ? "Creating Account..." : "Create Account"}</span>
              </button>
            </motion.div>
          </motion.form>

          <motion.div className="text-center" variants={fadeInUp}>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones"
      />

      {/* ✅ Floating Success Toast */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Account Created!</span>
        </motion.div>
      )}
    </div>
  );
};

export default SignUpPage;
