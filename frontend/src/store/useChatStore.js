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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] }); // clear messages on error
    } finally {
      set({ isMessagesLoading: false });
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
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [userId]: isTyping,
        },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off("newMessage");
    socket.off("userTyping");
  },

  sendTypingIndicator: (userId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.emit("typing", { userId, isTyping });
  },

  setSelectedUser: async (user) => {
    const current = get().selectedUser;

    if (current?._id === user?._id) return; // don’t refetch same user

    set({
      selectedUser: user,
      messages: [],
      isMessagesLoading: true,
    });

    if (user?._id) {
      await get().getMessages(user._id);
    } else {
      set({ isMessagesLoading: false });
    }
  },

  // Helper functions for UI
  getUnreadCount: (userId) => {
    const { messages } = get();
    const authUser = useAuthStore.getState().authUser;
    
    return messages.filter(
      (msg) => 
        msg.senderId === userId && 
        msg.receiverId === authUser?._id && 
        !msg.isRead
    ).length;
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
}));
