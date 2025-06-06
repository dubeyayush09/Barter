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

// app.use(
//   cors({
//     origin: "https://barter-chi.vercel.app", // your frontend domain
//     credentials: true, // only if you're using cookies/sessions
//   })
// );
app.use(cors());
app.use(
  cors({
    origin:"http://localhost:5173",
    credentials:true
  })
)
app.use(express.json());


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/creata")
  .then(() => console.log("MongoDB connect Nahi hua..thik se connection kar KUNJ LODE"))
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
  const userId = socket.handshake.query.userId;

  if (userId) {
    const existingSockets = onlineUsers.get(userId) || [];
    onlineUsers.set(userId, [...existingSockets, socket.id]);
  }
  console.log("user connected",userId)
  io.emit("userStatusUpdate", { userId, isOnline: true });

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
      let chats = await Chat.find({
        participants: userId,
      })
        .populate("participants", "name avatar status")
        .populate("messages.sender", "name avatar")
        .sort("-updatedAt");

      // Convert Mongoose docs to plain JS objects
      chats = chats.map((chat) => {
        const chatObj = chat.toObject();

        // Inject isOnline field based on onlineUsers map
        chatObj.participants = chatObj.participants.map((participant) => ({
          ...participant,
          isOnline: onlineUsers.has(participant._id.toString()),
        }));

        return chatObj;
      });

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
      console.log("message save ho gya");

      await chat.populate("messages.sender");
      const populatedMessage = chat.messages[chat.messages.length - 1];
      console.log("message populate ho gya");

      // Emit message to all participants
      chat.participants.forEach((participantId) => {
        const socketIds = onlineUsers.get(participantId.toString()) || [];
        socketIds.forEach((socketId) => {
          io.to(socketId).emit("receiveMessage", newMessage);
        });
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
    for (const [userId, sockets] of onlineUsers.entries()) {
      const updated = sockets.filter((id) => id !== socket.id);
      if (updated.length > 0) {
        onlineUsers.set(userId, updated);
      } else {
        onlineUsers.delete(userId);
        io.emit("userStatusUpdate", { userId, isOnline: false });
      }
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`BKL KUNJ ARORA Server running on port ${PORT}`);
});

export default app;
