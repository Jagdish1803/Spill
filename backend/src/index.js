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

const PORT = process.env.PORT || 3000;
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
          /\.railway\.app$/,
          /\.up\.railway\.app$/
        ]
      : "http://localhost:5173",
    credentials: true,
  })
);

// API routes - MUST come before static file serving
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Spill Chat API is running',
    version: '1.0.0'
  });
});

// Serve static files in production - FIXED PATHS
if (process.env.NODE_ENV === "production") {
  // Correct path to frontend dist folder
  const frontendDistPath = path.join(__dirname, "frontend", "dist");
  
  app.use(express.static(frontendDistPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === "production") {
    console.log(`Frontend static files served from: ${path.join(__dirname, "frontend", "dist")}`);
  }
  connectDB();
});