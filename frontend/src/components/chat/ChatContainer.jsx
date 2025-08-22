import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { User, Phone, Video, MoreHorizontal, ArrowDown, Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    sendMessage, // 👈 make sure your store exposes this
    isSendingMessage,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const isOnline = useMemo(() => onlineUsers.includes(selectedUser?._id), [onlineUsers, selectedUser?._id]);
  const isTyping = useMemo(() => typingUsers[selectedUser?._id], [typingUsers, selectedUser?._id]);

  // Fetch messages
  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);

  // Real-time subscription
  useEffect(() => {
    if (selectedUser?._id) subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (selectedUser?._id) requestAnimationFrame(() => scrollToBottom("auto"));
  }, [selectedUser?._id, scrollToBottom]);

  // Scroll button logic
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

  // Message bubble
  const MessageBubble = useCallback(
    ({ message, isOwn, showAvatar, showTime }) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex items-end gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        {showAvatar ? (
          <img
            src={isOwn ? authUser?.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}

        <div className={`flex flex-col max-w-[280px] sm:max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
          {showTime && (
            <div className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
              <span className="text-xs font-medium text-gray-600">{isOwn ? "You" : selectedUser?.fullname}</span>
              <span className="text-xs text-gray-500">{formatMessageTime(message.createdAt)}</span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0.8, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwn ? "bg-blue-500 text-white rounded-br-md" : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
            }`}
          >
            {message.image && (
              <img
                src={message.image}
                alt={message.text || "Image attachment"}
                className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image, "_blank")}
                loading="lazy"
              />
            )}
            {message.text && <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>}
          </motion.div>

          {isOwn && (
            <div className="flex items-center gap-1 mt-1 px-1 text-xs text-gray-400">
              {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
              {message.isRead ? "Read" : "Sent"}
            </div>
          )}
        </div>
      </motion.div>
    ),
    [authUser?.profilePic, selectedUser?.fullname, selectedUser?.profilePic]
  );

  // Message list
  const messageList = useMemo(
    () =>
      messages.map((msg, i) => {
        const isOwn = msg.senderId === authUser?._id;
        const prev = messages[i - 1];
        const showAvatar = !prev || prev.senderId !== msg.senderId;
        const showTime = !prev || prev.senderId !== msg.senderId || new Date(msg.createdAt) - new Date(prev.createdAt) > 300000;
        return <MessageBubble key={msg._id} message={msg} isOwn={isOwn} showAvatar={showAvatar} showTime={showTime} />;
      }),
    [messages, authUser?._id, MessageBubble]
  );

  if (isMessagesLoading) return <MessageSkeleton />;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      {/* ... header content same as before ... */}

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 relative custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-4">Send a message to start your conversation with {selectedUser?.fullname}</p>
            <button onClick={() => scrollToBottom()} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
              Say Hi 👋
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence>{messageList}</AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mb-3">
                <img src={selectedUser?.profilePic || "/avatar.png"} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </motion.div>
            )}
            <div ref={messageEndRef} />
          </>
        )}

        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              onClick={() => scrollToBottom()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 right-6 z-10 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={(text, imgs) => sendMessage(selectedUser._id, text, imgs)}
        isSendingMessage={isSendingMessage}
      />
    </div>
  );
};

export default ChatContainer;
