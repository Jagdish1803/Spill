import { useEffect, useState, useMemo, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Search, Users, X, Menu } from "lucide-react";
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
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Format message time
  const formatLastMessageTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return formatMessageTime(timestamp);
    if (diffInHours < 48) return "Yesterday";
    return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const truncateMessage = useCallback((text, maxLength = 35) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }, []);

  return (
    <aside
      className={`h-full transition-[width] duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden
      ${isOpen ? "w-80 lg:w-72" : "w-16"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Menu
            className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <>
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Contacts
              </h2>
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                {filteredUsers.length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      {isOpen && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* User List */}
      <div className="custom-scrollbar overflow-y-auto flex-1">
        {filteredUsers.length === 0 && !isUsersLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              No contacts found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try adjusting your search." : "Start a new chat."}
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
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative focus:outline-none
                    ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullname}
                      className="w-10 h-10 object-cover rounded-full border border-gray-200 dark:border-gray-600"
                      loading="lazy"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                    )}
                  </div>

                  {/* Content */}
                  {isOpen && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate text-sm ${
                          unreadCount > 0
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {user.fullname}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatLastMessageTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs truncate ${
                          unreadCount > 0
                            ? "font-medium text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {lastMessage?.text
                            ? truncateMessage(lastMessage.text)
                            : lastMessage?.image
                            ? "📷 Photo"
                            : isOnline
                            ? "Online"
                            : "Offline"}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {isOpen && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {onlineUsers.length} online
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
