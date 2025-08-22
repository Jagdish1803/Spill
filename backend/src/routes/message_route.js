// File: backend/src/routes/message_route.js
import express from "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
  markMessagesAsRead, 
  getUnreadCount 
} from "../controllers/message_controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/mark-read/:id", protectRoute, markMessagesAsRead);
router.get("/unread/:id", protectRoute, getUnreadCount);

export default router;