import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth_routes.js";
import messageRoutes from "./routes/message_route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3000; // Railway uses PORT 3000 by default
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Updated CORS configuration for Railway
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? [
          process.env.FRONTEND_URL || "https://spill-production.up.railway.app",
          /\.railway\.app$/,  // Allow all railway.app subdomains
          /\.up\.railway\.app$/  // Allow all up.railway.app subdomains
        ]
      : "http://localhost:5173",
    credentials: true,
  })
);

// Public health check endpoint for Railway (no authentication required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Additional health check route at root for Railway
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Spill Chat API is running',
    version: '1.0.0'
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});