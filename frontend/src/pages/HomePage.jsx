import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import { MessageSquare, ArrowLeft } from "lucide-react";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
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

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen pt-16">
        <div className="text-center">
          <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="flex h-full max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-sm">
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && showSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowSidebar(false)}
            />
            <div className="fixed left-0 top-16 bottom-0 w-80 max-w-[90vw] z-50">
              <Sidebar />
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header - Show when chat is selected */}
          {isMobile && selectedUser && (
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={handleBackToSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target"
              >
                <ArrowLeft className="size-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullname}
                  className="size-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedUser.fullname}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Chat Content */}
          {!selectedUser ? (
            <div className="flex-1 flex flex-col">
              {/* Mobile: Show sidebar toggle button */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h1>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target"
                  >
                    <MessageSquare className="size-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
              <NoChatSelected />
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