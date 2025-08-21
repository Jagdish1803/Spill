import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import { MessageSquare, ArrowLeft, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setShowSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when user is selected on mobile
  useEffect(() => {
    if (selectedUser && isMobile) {
      setShowSidebar(false);
    }
  }, [selectedUser, isMobile]);

  const handleBackToSidebar = () => {
    setSelectedUser(null);
    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen pt-16">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 pt-16 mobile-optimized">
      <div className="flex h-full max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-sm">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar with animation */}
        <AnimatePresence>
          {isMobile && showSidebar && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setShowSidebar(false)}
              />

              {/* Sidebar Slide-in */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="fixed left-0 top-16 bottom-0 w-80 max-w-[90vw] z-50"
              >
                <Sidebar onClose={() => setShowSidebar(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header - When user selected */}
          {isMobile && selectedUser && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10"
            >
              <button
                onClick={handleBackToSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target flex-shrink-0"
                aria-label="Back to contacts"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullname}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedUser.fullname}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Content */}
          {!selectedUser ? (
            <div className="flex-1 flex flex-col">
              {/* Mobile: Show header with sidebar toggle */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chats
                  </h1>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target"
                    aria-label="Open contacts"
                  >
                    <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
              <NoChatSelected
                onOpenSidebar={isMobile ? toggleSidebar : undefined}
              />
            </div>
          ) : (
            <ChatContainer />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
