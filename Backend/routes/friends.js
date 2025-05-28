import express from "express";
import { protect } from "../middleware/auth.js";
import Friend from "../models/Friend.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// @desc    Get user's friends
// @route   GET /api/friends
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requester: req.user._id, status: "accepted" },
        { recipient: req.user._id, status: "accepted" },
      ],
    })
      .populate("requester", "name avatar status")
      .populate("recipient", "name avatar status");
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
router.get("/requests", protect, async (req, res) => {
  try {
    const requests = await Friend.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "name avatar status");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Send friend request
// @route   POST /api/friends/request/:userId
// @access  Private
router.post("/request/:userId", protect, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot send friend request to yourself" });
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { requester: req.user._id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const friendRequest = await Friend.create({
      requester: req.user._id,
      recipient: req.params.userId,
    });

    // Create notification for recipient
    await Notification.create({
      user: req.params.userId,
      type: "friend",
      message: `${req.user.name} sent you a friend request`,
      relatedTo: req.user._id,
      relatedModel: "User",
    });

    const populatedRequest = await Friend.findById(friendRequest._id)
      .populate("requester", "name avatar status")
      .populate("recipient", "name avatar status");

    res.status(201).json(populatedRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Accept/Reject friend request
// @route   PUT /api/friends/request/:requestId
// @access  Private
router.put("/request/:requestId", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Friend.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    // Create notification for requester
    await Notification.create({
      user: request.requester,
      type: "friend",
      message: `${req.user.name} ${status} your friend request`,
      relatedTo: req.user._id,
      relatedModel: "User",
    });

    const populatedRequest = await Friend.findById(request._id)
      .populate("requester", "name avatar status")
      .populate("recipient", "name avatar status");

    res.json(populatedRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
router.delete("/:friendId", protect, async (req, res) => {
  try {
    const friendship = await Friend.findOne({
      _id: req.params.friendId,
      status: "accepted",
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    await friendship.remove();
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
