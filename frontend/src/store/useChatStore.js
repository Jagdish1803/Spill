// File: frontend/src/store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.jsx";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  typingUsers: {},
  unreadCounts: {}, // Track unread counts per user

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      
      // Initialize unread counts
      const authUser = useAuthStore.getState().authUser;
      const unreadCounts = {};
      
      // Get unread counts for each user (you might want to add this to your backend)
      for (const user of res.data) {
        try {
          const messagesRes = await axiosInstance.get(`/messages/${user._id}`);
          const unreadCount = messagesRes.data.filter(
            msg => msg.senderId === user._id && 
                   msg.receiverId === authUser?._id && 
                   !msg.isRead
          ).length;
          unreadCounts[user._id] = unreadCount;
        } catch (error) {
          unreadCounts[user._id] = 0;
        }
      }
      
      set({ unreadCounts });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Mark messages as read when fetched
      await get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // New function to mark messages as read
  markMessagesAsRead: async (userId) => {
    try {
      const authUser = useAuthStore.getState().authUser;
      const { messages, unreadCounts } = get();
      
      const unreadMessages = messages.filter(
        msg => msg.senderId === userId && 
               msg.receiverId === authUser?._id && 
               !msg.isRead
      );

      if (unreadMessages.length > 0) {
        // Update messages locally first for immediate UI update
        const updatedMessages = messages.map(msg => 
          msg.senderId === userId && msg.receiverId === authUser?._id 
            ? { ...msg, isRead: true }
            : msg
        );
        
        // Update unread count
        const updatedUnreadCounts = {
          ...unreadCounts,
          [userId]: 0
        };
        
        set({ 
          messages: updatedMessages, 
          unreadCounts: updatedUnreadCounts 
        });

        // Send read status to backend (you'll need to implement this endpoint)
        try {
          await axiosInstance.put(`/messages/mark-read/${userId}`);
        } catch (error) {
          console.error("Failed to update read status on server:", error);
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser: currentSelected, messages, unreadCounts } = get();
      const authUser = useAuthStore.getState().authUser;
      
      // Always add the message to the messages array
      set({ messages: [...messages, newMessage] });

      // If message is for currently selected user, mark as read immediately
      if (newMessage.senderId === currentSelected?._id) {
        get().markMessagesAsRead(newMessage.senderId);
      } else if (newMessage.senderId !== authUser?._id) {
        // Update unread count for other users
        const currentCount = unreadCounts[newMessage.senderId] || 0;
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]: currentCount + 1
          }
        });
      }
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [userId]: isTyping,
        },
      }));
    });

    // Listen for message read events
    socket.on("messageRead", ({ userId, messageIds }) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("messageRead");
  },

  sendTypingIndicator: (userId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.emit("typing", { userId, isTyping });
  },

  setSelectedUser: async (user) => {
    const current = get().selectedUser;

    if (current?._id === user?._id) return;

    // Unsubscribe from previous user's messages
    if (current) {
      get().unsubscribeFromMessages();
    }

    set({
      selectedUser: user,
      messages: [],
      isMessagesLoading: true,
    });

    if (user?._id) {
      await get().getMessages(user._id);
      // Subscribe to new user's messages
      get().subscribeToMessages();
    } else {
      set({ isMessagesLoading: false });
    }
  },

  // Enhanced helper functions
  getUnreadCount: (userId) => {
    const { unreadCounts } = get();
    return unreadCounts[userId] || 0;
  },

  getLastMessage: (userId) => {
    const { messages } = get();
    const authUser = useAuthStore.getState().authUser;
    
    const userMessages = messages.filter(
      (msg) => 
        (msg.senderId === userId && msg.receiverId === authUser?._id) ||
        (msg.senderId === authUser?._id && msg.receiverId === userId)
    );
    
    return userMessages[userMessages.length - 1];
  },

  // Clear unread count when user opens chat
  clearUnreadCount: (userId) => {
    const { unreadCounts } = get();
    set({
      unreadCounts: {
        ...unreadCounts,
        [userId]: 0
      }
    });
  },

  // Get total unread messages count
  getTotalUnreadCount: () => {
    const { unreadCounts } = get();
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  },
}));