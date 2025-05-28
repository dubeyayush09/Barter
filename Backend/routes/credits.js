import express from "express";
import { protect } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// @desc    Get user's transactions
// @route   GET /api/credits/transactions
// @access  Private
router.get("/transactions", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
    })
      .populate("fromUser", "name avatar")
      .populate("toUser", "name avatar")
      .populate("task", "title")
      .sort("-createdAt");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Transfer credits to user
// @route   POST /api/credits/transfer
// @access  Private
router.post("/transfer", protect, async (req, res) => {
  try {
    const { toUserId, amount, notes } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const sender = await User.findById(req.user._id);
    if (sender.creditBalance < amount) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Create transaction
    const transaction = await Transaction.create({
      fromUser: req.user._id,
      toUser: toUserId,
      amount,
      type: "direct_transfer",
      status: "completed",
      notes,
    });

    // Update credit balances
    sender.creditBalance -= amount;
    recipient.creditBalance += amount;
    await Promise.all([sender.save(), recipient.save()]);

    // Create notifications
    await Notification.create({
      user: toUserId,
      type: "credit",
      message: `${sender.name} sent you ${amount} credits`,
      relatedTo: transaction._id,
      relatedModel: "Transaction",
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("fromUser", "name avatar")
      .populate("toUser", "name avatar");

    res.status(201).json(populatedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get credit balance
// @route   GET /api/credits/balance
// @access  Private
router.get("/balance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ balance: user.creditBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
