import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? [
          process.env.FRONTEND_URL || "https://spill-production.up.railway.app",
          /\.railway\.app$/,
          /\.up\.railway\.app$/
        ]
      : ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ userId, isTyping }) => {
    const recipientSocketId = getReceiverSocketId(userId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit("userTyping", {
        userId: Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id),
        isTyping
      });
    }
  });
});

export { io, app, server };