import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { User, Phone, Video, MoreHorizontal, ArrowDown } from "lucide-react";

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

  const isOnline = useMemo(() => 
    onlineUsers.includes(selectedUser?._id), 
    [onlineUsers, selectedUser?._id]
  );
  
  const isTyping = useMemo(() => 
    typingUsers[selectedUser?._id], 
    [typingUsers, selectedUser?._id]
  );

  // Fetch messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (selectedUser?._id) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Auto scroll to bottom with performance optimization
  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ 
        behavior,
        block: "end"
      });
    }
  }, []);

  // Handle new messages scrolling
  useEffect(() => {
    const newMessageCount = messages.length;
    const hasNewMessages = newMessageCount > lastMessageCount;
    
    if (hasNewMessages && isNearBottom) {
      // Use immediate scroll for better UX on new messages
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
    
    setLastMessageCount(newMessageCount);
  }, [messages.length, isNearBottom, lastMessageCount, scrollToBottom]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    setIsNearBottom(distanceFromBottom < 100);
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  // Throttled scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let timeoutId = null;
    const throttledScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 16); // ~60fps
      }
    };

    chatContainer.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      chatContainer.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Memoized message bubble component
  const MessageBubble = useCallback(({ message, isOwn, showAvatar, showTime }) => (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""} animate-fade-in`}>
      {/* Avatar */}
      {showAvatar && (
        <img
          src={isOwn ? authUser?.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
      )}
      {!showAvatar && <div className="w-8 h-8 flex-shrink-0" />}
      
      {/* Message bubble */}
      <div className={`flex flex-col max-w-[280px] sm:max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {showTime && (
          <div className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isOwn ? "You" : selectedUser?.fullname}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2.5 max-w-full contain-paint ${
            isOwn
              ? "bg-blue-500 text-white rounded-br-md shadow-sm"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md shadow-sm"
          }`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity crisp-edges"
              onClick={() => window.open(message.image, '_blank')}
              loading="lazy"
              decoding="async"
            />
          )}
          {message.text && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>
          )}
        </div>
        
        {isOwn && (
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-gray-400">
              ✓ {message.isRead ? "Read" : "Sent"}
            </span>
          </div>
        )}
      </div>
    </div>
  ), [authUser?.profilePic, selectedUser?.fullname, selectedUser?.profilePic]);

  // Optimized message list with memoization
  const messageList = useMemo(() => {
    return messages.map((message, index) => {
      const isOwn = message.senderId === authUser?._id;
      const prevMessage = messages[index - 1];
      const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
      const showTime = !prevMessage || 
        prevMessage.senderId !== message.senderId || 
        new Date(message.createdAt) - new Date(prevMessage.createdAt) > 300000; // 5 minutes

      return (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          showTime={showTime}
        />
      );
    });
  }, [messages, authUser?._id, MessageBubble]);

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
      {/* Header - Hidden on mobile, handled by HomePage */}
      <div className="hidden md:flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullname || "User"}
              className="w-10 h-10 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
              loading="lazy"
              decoding="async"
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
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </span>
                </span>
              ) : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-900 custom-scrollbar will-change-scroll relative mobile-optimized"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Send a message to start your conversation with {selectedUser?.fullname}
            </p>
          </div>
        ) : (
          <>
            {messageList}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 mb-3 animate-fade-in">
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  loading="lazy"
                  decoding="async"
                />
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="fixed bottom-24 right-4 md:right-6 z-10 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 touch-target"
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