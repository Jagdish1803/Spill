// File: frontend/src/components/chat/ChatContainer.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { 
  User, 
  Phone, 
  Video, 
  MoreHorizontal, 
  ArrowDown, 
  Check, 
  CheckCheck,
  Dot,
  Info,
  Search
} from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    sendMessage,
    isSendingMessage,
    markMessagesAsRead,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const isOnline = useMemo(() => 
    onlineUsers.includes(selectedUser?._id), 
    [onlineUsers, selectedUser?._id]
  );
  
  const isTyping = useMemo(() => 
    typingUsers[selectedUser?._id], 
    [typingUsers, selectedUser?._id]
  );

  // Fetch messages and mark as read
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      markMessagesAsRead(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages, markMessagesAsRead]);

  // Real-time subscription
  useEffect(() => {
    if (selectedUser?._id) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (selectedUser?._id && messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [selectedUser?._id, messages.length, scrollToBottom]);

  // Show/hide scroll button
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
  }, []);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    
    const listener = () => requestAnimationFrame(handleScroll);
    el.addEventListener("scroll", listener, { passive: true });
    
    return () => el.removeEventListener("scroll", listener);
  }, [handleScroll]);

  // Enhanced Message Bubble Component
  const MessageBubble = useCallback(({ message, isOwn, showAvatar, showTime }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex items-end gap-3 mb-4 group ${isOwn ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={isOwn ? authUser?.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
            loading="lazy"
            onClick={() => !isOwn && setShowUserInfo(true)}
          />
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] sm:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {/* Time and sender info */}
        <AnimatePresence>
          {showTime && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 mb-2 px-1 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {isOwn ? "You" : selectedUser?.fullname}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatMessageTime(message.createdAt)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message content */}
        <motion.div
          initial={{ opacity: 0.8, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm relative ${
            isOwn 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md" 
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md"
          }`}
        >
          {/* Image */}
          {message.image && (
            <motion.img
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              src={message.image}
              alt={message.text || "Image attachment"}
              className="max-w-full h-auto rounded-xl mb-3 cursor-pointer transition-transform"
              onClick={() => window.open(message.image, "_blank")}
              loading="lazy"
            />
          )}
          
          {/* Text */}
          {message.text && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>
          )}

          {/* Message status for own messages */}
          <AnimatePresence>
            {isOwn && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1 mt-2 text-xs text-white/80"
              >
                {message.isRead ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    <span>Read</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>Sent</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  ), [authUser?.profilePic, selectedUser?.fullname, selectedUser?.profilePic]);

  // Generate message list with proper grouping
  const messageList = useMemo(() => {
    return messages.map((msg, i) => {
      const isOwn = msg.senderId === authUser?._id;
      const prev = messages[i - 1];
      const showAvatar = !prev || prev.senderId !== msg.senderId;
      const showTime = !prev || 
                      prev.senderId !== msg.senderId || 
                      (new Date(msg.createdAt) - new Date(prev.createdAt)) > 300000; // 5 minutes

      return (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={isOwn}
          showAvatar={showAvatar}
          showTime={showTime}
        />
      );
    });
  }, [messages, authUser?._id, MessageBubble]);

  if (isMessagesLoading) {
    return <MessageSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          {/* User Avatar with status */}
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullname}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
              onClick={() => setShowUserInfo(true)}
            />
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
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
              {selectedUser?.fullname}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOnline ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <Dot className="w-3 h-3 animate-pulse" />
                    Active now
                  </span>
                ) : (
                  "Offline"
                )}
              </p>
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1 text-blue-500 dark:text-blue-400"
                  >
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-xs">typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Search in conversation"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserInfo(!showUserInfo)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="User info"
          >
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 relative custom-scrollbar"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-4"
            >
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Start your conversation with {selectedUser?.fullname}. 
              Send a message below to get things going!
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToBottom()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              Say Hello 👋
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Messages */}
            <AnimatePresence initial={false}>
              {messageList}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  className="flex items-end gap-3 mb-4"
                >
                  <img
                    src={selectedUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  />
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={messageEndRef} />
          </>
        )}

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToBottom()}
              className="fixed bottom-28 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-20"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;