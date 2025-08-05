import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth_routes.js";
import messageRoutes from "./routes/message_route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Spill Chat API is running',
    version: '1.0.0'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Path from backend/src to frontend/dist
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  
  console.log('Serving static files from:', frontendDistPath);
  
  // Check if dist folder exists
  try {
    const fs = await import('fs');
    if (fs.existsSync(frontendDistPath)) {
      console.log('✅ Frontend dist folder found');
      
      // Serve static files
      app.use(express.static(frontendDistPath));

      // Handle client-side routing - serve index.html for all non-API routes
      app.get("*", (req, res) => {
        const indexPath = path.join(frontendDistPath, "index.html");
        console.log('Serving index.html for:', req.path);
        res.sendFile(indexPath);
      });
    } else {
      console.log('❌ Frontend dist folder not found at:', frontendDistPath);
      
      // Fallback response
      app.get("*", (req, res) => {
        res.status(404).json({ 
          error: 'Frontend not built',
          message: 'The frontend application was not properly built. Please check build logs.',
          path: req.path
        });
      });
    }
  } catch (error) {
    console.error('Error checking frontend dist folder:', error);
  }
} else {
  // Development mode
  app.get("/", (req, res) => {
    res.json({ 
      message: "API is running in development mode",
      frontend: "Run frontend separately on port 5173"
    });
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Current directory: ${__dirname}`);
  connectDB();
});