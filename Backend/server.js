import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import creditRoutes from "./routes/credits.js";
import notificationRoutes from "./routes/notifications.js";
import friendRoutes from "./routes/friends.js";
import chatRoutes from "./routes/chats.js";
import { verifySocketToken } from "./middleware/auth.js";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config(); 

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000

// Middleware
// const cors = require("cors");

app.use(
  cors({
    origin: "http://xchangeup.vercel.app", // your frontend domain
    credentials: true, // only if you're using cookies/sessions
  })
);
app.use(express.json());


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/creata")
  .then(() => console.log("MongoDB connect Nahi hua..thik se kar KUNJ LODE"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chats", chatRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Creata API is running");
});

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// Socket.IO middleware for authentication
io.use(verifySocketToken);

// Online users map
const onlineUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  const userId = socket.user._id;
  console.log(`User connected: ${userId}`);

  // Add user to online users
  onlineUsers.set(userId, socket.id);

  // Join user's room for private messages
  socket.join(userId);

  // Handle joining a chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  // Handle leaving a chat room
  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
  });

  // Handle getting user's chats
  socket.on("getChats", async (callback) => {
    try {
      const chats = await Chat.find({
        participants: userId,
      })
        .populate("participants", "name avatar status")
        .populate("messages.sender", "name avatar")
        .sort("-updatedAt");

      callback({ success: true, chats });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle getting chat history
  socket.on("getChatHistory", async (chatId, callback) => {
    try {
      const chat = await Chat.findById(chatId)
        .populate("participants", "name avatar status")
        .populate("messages.sender", "name avatar");

      if (!chat) {
        return callback({ success: false, error: "Chat not found" });
      }

      callback({ success: true, chat, messages: chat.messages });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async (messageData, callback) => {
    try {
      const { chatId, content, sender } = messageData;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return callback({ success: false, error: "Chat not found" });
      }

      const newMessage = {
        sender,
        content,
        createdAt: new Date(),
      };

      chat.messages.push(newMessage);
      chat.lastMessage = new Date();
      await chat.save();

      // Emit message to all participants
      chat.participants.forEach((participantId) => {
        const participantSocketId = onlineUsers.get(participantId.toString());
        if (participantSocketId) {
          io.to(participantSocketId).emit("receiveMessage", newMessage);
        }
      });

      callback({ success: true, message: newMessage });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle user search
  socket.on("searchUsers", async (searchTerm, callback) => {
    try {
      const users = await User.find({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              { name: { $regex: searchTerm, $options: "i" } },
              { email: { $regex: searchTerm, $options: "i" } },
            ],
          },
        ],
      }).select("name email avatar status");

      callback({ success: true, users });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle starting a new chat
  socket.on("startChat", async (otherUserId, callback) => {
    try {
      let chat = await Chat.findOne({
        participants: { $all: [userId, otherUserId] },
      }).populate("participants", "name avatar status");

      if (chat) {
        return callback({ success: true, chat });
      }

      chat = await Chat.create({
        participants: [userId, otherUserId],
        messages: [],
      });

      chat = await Chat.findById(chat._id).populate(
        "participants",
        "name avatar status"
      );

      // Notify other user
      const otherUserSocketId = onlineUsers.get(otherUserId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("newChat", chat);
      }

      callback({ success: true, chat });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    onlineUsers.delete(userId);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`BKL KUNJ ARORA Server running on port ${PORT}`);
});

export default app;
