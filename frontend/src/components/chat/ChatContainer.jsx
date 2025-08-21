import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  const isOnline = useMemo(
    () => onlineUsers.includes(selectedUser?._id),
    [onlineUsers, selectedUser?._id]
  );

  const isTyping = useMemo(
    () => typingUsers[selectedUser?._id],
    [typingUsers, selectedUser?._id]
  );

  // Fetch messages when user changes
  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (selectedUser?._id) subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    const newCount = messages.length;
    const hasNew = newCount > lastMessageCount;
    if (hasNew && isNearBottom) requestAnimationFrame(() => scrollToBottom("auto"));
    setLastMessageCount(newCount);
  }, [messages.length, isNearBottom, lastMessageCount, scrollToBottom]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distance = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distance < 100);
    setShowScrollButton(distance > 200);
  }, []);

  // Attach throttled scroll listener
  useEffect(() => {
    const chatEl = chatContainerRef.current;
    if (!chatEl) return;
    let timeoutId = null;
    const throttled = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 16);
      }
    };
    chatEl.addEventListener("scroll", throttled, { passive: true });
    return () => {
      chatEl.removeEventListener("scroll", throttled);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Message bubble
  const MessageBubble = useCallback(
    ({ message, isOwn, showAvatar, showTime }) => (
      <div
        className={`flex items-end gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""} animate-fade-in`}
      >
        {showAvatar ? (
          <img
            src={
              isOwn
                ? authUser?.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png"
            }
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}

        <div
          className={`flex flex-col max-w-[280px] sm:max-w-xs lg:max-w-md ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          {showTime && (
            <div
              className={`flex items-center gap-2 mb-1 px-1 ${
                isOwn ? "flex-row-reverse" : ""
              }`}
            >
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {isOwn ? "You" : selectedUser?.fullname}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          )}

          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwn
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md"
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
            {message.text && (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.text}
              </p>
            )}
          </div>

          {isOwn && (
            <div className="flex items-center gap-1 mt-1 px-1 text-xs text-gray-400">
              {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
              {message.isRead ? "Read" : "Sent"}
            </div>
          )}
        </div>
      </div>
    ),
    [authUser?.profilePic, selectedUser?.fullname, selectedUser?.profilePic]
  );

  // Build message list
  const messageList = useMemo(
    () =>
      messages.map((msg, i) => {
        const isOwn = msg.senderId === authUser?._id;
        const prev = messages[i - 1];
        const showAvatar = !prev || prev.senderId !== msg.senderId;
        const showTime =
          !prev ||
          prev.senderId !== msg.senderId ||
          new Date(msg.createdAt) - new Date(prev.createdAt) > 300000;
        return (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showTime={showTime}
          />
        );
      }),
    [messages, authUser?._id, MessageBubble]
  );

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-full"></div>
            <div>
              <div className="skeleton h-4 w-32 mb-1"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
        </div>
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullname || "User"}
              className="w-10 h-10 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
              loading="lazy"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedUser?.fullname || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">Typing</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </span>
                </span>
              ) : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-900 custom-scrollbar relative"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
              Send a message to start your conversation with {selectedUser?.fullname}
            </p>
            <button
              onClick={() => scrollToBottom("smooth")}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Say Hi 👋
            </button>
          </div>
        ) : (
          <>
            {messageList}
            {isTyping && (
              <div className="flex items-center gap-2 mb-3 animate-fade-in">
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </>
        )}

        {showScrollButton && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="fixed bottom-24 right-4 md:right-6 z-10 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
