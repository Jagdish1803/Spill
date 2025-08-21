import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Save, Bell, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SettingPage = () => {
  const { authUser, updatePassword } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoading(true);
      await updatePassword(formData.currentPassword, formData.newPassword);
      toast.success("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
    } catch (err) {
      toast.error(err.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Animation Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      className="p-8 max-w-5xl mx-auto space-y-8"
      initial="hidden"
      animate="visible"
    >
      {/* Change Password */}
      <motion.div
        custom={0}
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
          {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
            <div key={field} className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {field === "currentPassword"
                  ? "Current Password"
                  : field === "newPassword"
                  ? "New Password"
                  : "Confirm Password"}
              </label>
              <input
                type={showPasswords[field] ? "text" : "password"}
                value={formData[field]}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                }
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
                disabled={loading}
              />
              <motion.button
                type="button"
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={() => togglePasswordVisibility(field)}
                aria-label={showPasswords[field] ? "Hide password" : "Show password"}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPasswords[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <motion.button
              type="reset"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
              }}
              className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Updating..." : "Update Password"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Notifications */}
      <motion.div
        custom={1}
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enable or disable app notifications
          </p>
        </div>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`relative w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors ${
            notificationsEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="bg-white w-5 h-5 rounded-full shadow"
          />
        </motion.div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        custom={2}
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
        <div className="mt-4 space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Username:</span> {authUser.username || "N/A"}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {authUser.email || "N/A"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingPage;
