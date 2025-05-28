import express from "express";
import { protect } from "../middleware/auth.js";
import Chat from "../models/Chat.js";

const router = express.Router();

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar status")
      .sort("-lastMessage");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "name avatar status")
      .populate("messages.sender", "name avatar");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (
      !chat.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create or get chat with user
// @route   POST /api/chats/user/:userId
// @access  Private
router.post("/user/:userId", protect, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot create chat with yourself" });
    }

    let chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, req.params.userId],
      },
    }).populate("participants", "name avatar status");

    if (chat) {
      return res.json(chat);
    }

    chat = await Chat.create({
      participants: [req.user._id, req.params.userId],
    });

    chat = await Chat.findById(chat._id).populate(
      "participants",
      "name avatar status"
    );

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Send message in chat
// @route   POST /api/chats/:id/messages
// @access  Private
router.post("/:id/messages", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (
      !chat.participants.some((p) => p.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    chat.messages.push({
      sender: req.user._id,
      content: req.body.content,
    });

    chat.lastMessage = Date.now();
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name avatar status")
      .populate("messages.sender", "name avatar");

    res.json(populatedChat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/chats/:id/read
// @access  Private
router.put("/:id/read", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (
      !chat.participants.some((p) => p.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Chat.updateOne(
      { _id: chat._id },
      {
        $set: {
          "messages.$[elem].read": true,
        },
      },
      {
        arrayFilters: [
          { "elem.sender": { $ne: req.user._id }, "elem.read": false },
        ],
        multi: true,
      }
    );

    const updatedChat = await Chat.findById(chat._id)
      .populate("participants", "name avatar status")
      .populate("messages.sender", "name avatar");

    res.json(updatedChat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
