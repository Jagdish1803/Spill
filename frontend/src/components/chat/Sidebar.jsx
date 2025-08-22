// File: frontend/src/components/chat/Sidebar.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Search, Users, X, Menu, MessageCircle, Dot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMessageTime } from "../../lib/utils";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    getUnreadCount,
    getLastMessage,
    isUsersLoading,
    clearUnreadCount,
    getTotalUnreadCount,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users by search input
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Sort users by unread messages and activity
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aUnread = getUnreadCount(a._id);
      const bUnread = getUnreadCount(b._id);
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      const aLastMessage = getLastMessage(a._id);
      const bLastMessage = getLastMessage(b._id);

      // Priority: unread messages > online status > recent activity
      if (aUnread !== bUnread) return bUnread - aUnread;
      if (aOnline !== bOnline) return bOnline - aOnline;
      
      const aTime = aLastMessage?.createdAt ? new Date(aLastMessage.createdAt).getTime() : 0;
      const bTime = bLastMessage?.createdAt ? new Date(bLastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredUsers, getUnreadCount, onlineUsers, getLastMessage]);

  // Format last message time
  const formatLastMessageTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return formatMessageTime(timestamp);
    if (diffInHours < 48) return "Yesterday";
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  // Truncate long message text
  const truncateMessage = useCallback((text, maxLength = 35) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }, []);

  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
    clearUnreadCount(user._id);
  }, [setSelectedUser, clearUnreadCount]);

  const totalUnread = getTotalUnreadCount();

  return (
    <aside
      className={`h-full transition-[width] duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden ${
        isOpen ? "w-80 lg:w-72" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {totalUnread > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </motion.div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Chats
                </h2>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {filteredUsers.length}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white transition-all placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isUsersLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                {isOpen && (
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Start a conversation to see it here"}
            </p>
          </div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {sortedUsers.map((user, index) => {
                const isOnline = onlineUsers.includes(user._id);
                const unreadCount = getUnreadCount(user._id);
                const lastMessage = getLastMessage(user._id);
                const isSelected = selectedUser?._id === user._id;

                return (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative focus:outline-none group ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-r-2 border-blue-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                    whileHover={{ scale: isOpen ? 1.01 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullname}
                        className="w-12 h-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600 transition-all group-hover:border-blue-300"
                        loading="lazy"
                      />
                      
                      {/* Online indicator */}
                      <AnimatePresence>
                        {isOnline && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center"
                          >
                            <Dot className="w-2 h-2 text-white animate-pulse" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Unread indicator */}
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg"
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold truncate text-sm transition-colors ${
                              unreadCount > 0 || isSelected
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {user.fullname}
                            </p>
                            
                            {lastMessage && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                {formatLastMessageTime(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate transition-colors ${
                              unreadCount > 0
                                ? "font-medium text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {lastMessage?.text
                                ? truncateMessage(lastMessage.text)
                                : lastMessage?.image
                                ? "📷 Photo"
                                : isOnline
                                ? "🟢 Online"
                                : "⚫ Offline"}
                            </p>
                          </div>
                        </motion.div>
                      )}
                                                </AnimatePresence>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span>{onlineUsers.length} online</span>
              </div>
              
              {totalUnread > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {totalUnread} unread
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;