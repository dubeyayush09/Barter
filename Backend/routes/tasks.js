import express from "express";
import { protect } from "../middleware/auth.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .sort("-createdAt");
      // console.log(tasks)
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get user's created tasks
// @route   GET /api/tasks/created
// @access  Private
router.get("/created/:id", protect, async (req, res) => {
  try {

    // const { id } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   console.log("invalid id")
    //   return res.status(400).json({ message: "Invalid task ID" });
    // }
    const tasks = await Task.find({_id:req.params.id})
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .sort("-createdAt");
      // console.log("This is at router get created",tasks)
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get tasks assigned to user
// @route   GET /api/tasks/assigned
// @access  Private
router.get("/assigned", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .sort("-createdAt");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, credits, skills, deadline } = req.body;
    // console.log("user is : ", req.user)
     
    // Check if user has enough credits
    const user = await User.findById(req.user._id);
    // console.log("checking credits")
    if (user.creditBalance < credits) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Create task
    // console.log("creating task")
    // console.log(title,description,credits,skills,deadline,req.user._id)
    
    
  
      const task = await Task.create({
      title,
      description,
      credits,
      skills,
      deadline,
      createdBy: req.user._id,
    });
  

    // Deduct credits from user
    // console.log("deducting task")
    user.creditBalance -= credits;
    await user.save();

    // Create transaction record
    // console.log("creating transaction")
    await Transaction.create({
      fromUser: req.user._id,
      amount: credits,
      type: "task_payment",
      task: task._id,
      status: "completed",
    });
    // console.log("populating task")

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar");

      // console.log(populatedTask)

    res.status(201).json(populatedTask);
  } catch (err) {
    // console.log("found error at create task in backend")
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar");

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (task.status !== "open") {
      return res
        .status(400)
        .json({ message: "Cannot delete task that is not open" });
    }

    await task.remove();
    res.json({ message: "Task removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
