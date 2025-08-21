import { useEffect, useState, useMemo, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Search, Users, X } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";

const Sidebar = () => {
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    getUnreadCount,
    getLastMessage,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Memoize filtered users for better performance
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const formatLastMessageTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return formatMessageTime(timestamp);
    if (diffInHours < 48) return "Yesterday";
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const truncateMessage = useCallback((text, maxLength = 35) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (isUsersLoading) {
    return (
      <aside className="h-full w-80 lg:w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="skeleton h-8 w-full rounded-lg"></div>
        </div>
        <div className="custom-scrollbar overflow-y-auto flex-1 p-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-full rounded"></div>
                <div className="skeleton h-3 w-2/3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-80 lg:w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Contacts
            </h2>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            {filteredUsers.length}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-target"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="custom-scrollbar overflow-y-auto flex-1">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No contacts found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try adjusting your search." : "Start a conversation with someone new."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const unreadCount = getUnreadCount(user._id);
              const lastMessage = getLastMessage(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullname}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
                      loading="lazy"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    {/* Name and Time */}
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium truncate text-sm ${
                        unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-200"
                      }`}>
                        {user.fullname}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatLastMessageTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {/* Last Message and Unread Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${
                          unreadCount > 0 ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {lastMessage ? (
                            <>
                              {lastMessage.image && !lastMessage.text && (
                                <span className="inline-flex items-center gap-1">
                                  📷 <span>Photo</span>
                                </span>
                              )}
                              {lastMessage.text && truncateMessage(lastMessage.text)}
                              {!lastMessage.text && !lastMessage.image && "No messages yet"}
                            </>
                          ) : (
                            <span className={`inline-flex items-center gap-1 ${isOnline ? "text-green-600 dark:text-green-400" : ""}`}>
                              <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center ml-2 flex-shrink-0">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with online count */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{onlineUsers.length} online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;