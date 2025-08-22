// File: backend/src/controllers/message_controller.js
import User from "../models/user_model.js";
import Message from "../models/message_model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Get last message and unread count for each user
    const usersWithDetails = await Promise.all(
      filteredUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: false
        });

        return {
          ...user.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort by last message time or unread status
    usersWithDetails.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      
      const aTime = a.lastMessage?.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || new Date(0);
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(usersWithDetails);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Real-time notification to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// New endpoint to mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    // Update all unread messages from this sender to current user
    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    // Notify sender that their messages have been read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && result.modifiedCount > 0) {
      const readMessages = await Message.find({
        senderId: senderId,
        receiverId: receiverId,
        isRead: true
      }).select('_id');
      
      io.to(senderSocketId).emit("messageRead", {
        userId: receiverId,
        messageIds: readMessages.map(msg => msg._id.toString())
      });
    }

    res.status(200).json({ 
      success: true, 
      markedAsRead: result.modifiedCount 
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread message count for a specific user
export const getUnreadCount = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const count = await Message.countDocuments({
      senderId: senderId,
      receiverId: receiverId,
      isRead: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.log("Error in getUnreadCount controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};