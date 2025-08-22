import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  Mail,
  User,
  Calendar,
  Shield,
  LogOut,
  Loader2,
  MessageSquare,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ProfilePage = () => {
  const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImg(reader.result);
      setShowUpdateButton(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!selectedImg) return toast.error("No image selected");

    try {
      await updateProfile({ profilePic: selectedImg });
      toast.success("Profile updated successfully!");
      setShowUpdateButton(false);
      setSelectedImg(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile"
      );
    }
  };

  const handleCancelUpdate = () => {
    setSelectedImg(null);
    setShowUpdateButton(false);
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your profile details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-md border p-6">
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4 group">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                      isUpdatingProfile ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Camera className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                      aria-label="Upload profile picture"
                    />
                  </label>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Hover & click to change photo
                </p>

                {showUpdateButton && (
                  <div className="flex gap-2 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm shadow-sm transition"
                      aria-label="Save profile picture"
                    >
                      {isUpdatingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isUpdatingProfile ? "Updating..." : "Save"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelUpdate}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm shadow-sm transition"
                      aria-label="Cancel profile update"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md border p-6"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700">Basic Information</p>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <p className="text-gray-700">Full Name</p>
                  </label>
                  <div className="flex border p-3 rounded-md items-center bg-gray-50">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                        className="outline-none bg-transparent text-black w-full"
                      value={authUser?.fullname || "Not provided"}
                      readOnly
                      aria-label="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <p className="text-gray-700">Email Address</p>
                  </label>
                  <div className="flex border p-3 rounded-md items-center bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="email"
                      className="outline-none bg-transparent text-black w-full"
                      value={authUser?.email || "Not provided"}
                      readOnly
                      aria-label="Email address"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md border p-6"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700">Account Information</p>
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 text-gray-400" />
                    {authUser ?.createdAt
                      ? new Date(authUser.createdAt).toLocaleDateString()
                      : "Not available"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>

                
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md border p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Actions</h2>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  disabled={isUpdatingProfile}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 px-4 rounded-md shadow-sm transition flex items-center justify-center gap-2"
                  aria-label="Logout from account"
                >
                  <LogOut className="w-5 h-5" />
                  Logout from Account
                </motion.button>
                <p className="text-sm text-gray-500 text-center">
                  You will be redirected to the login page
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
