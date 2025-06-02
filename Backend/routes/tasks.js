import express from "express";
import { protect } from "../middleware/auth.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Notification from '../models/Notification.js'; // adjust the path if needed


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


// @desc    Assign task to user
// @route   POST /api/tasks/:id/assign
// @access  Private
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task cannot be assigned' });
    }

    // Check if user has requested the task
    if (!task.requestedBy.includes(userId)) {
      return res.status(400).json({ message: 'User has not requested this task' });
    }

    // Move credits to escrow
    const creator = await User.findById(task.createdBy);
    if (creator.creditBalance < task.credits) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    creator.creditBalance -= task.credits;
    task.escrowAmount = task.credits;
    task.status = 'assigned';
    task.assignedTo = userId;

    await Promise.all([creator.save(), task.save()]);

    // Create transaction record
    await Transaction.create({
      fromUser: task.createdBy,
      amount: task.credits,
      type: 'task_payment',
      task: task._id,
      status: 'pending'
    });

    // Create notification for assigned user
    await Notification.create({
      user: userId,
      type: 'task',
      message: `You have been assigned to the task: ${task.title}`,
      relatedTo: task._id,
      relatedModel: 'Task'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('requestedBy', 'name avatar');

    // Emit socket event
    req.app.get('io').emit('taskUpdated', populatedTask);

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// @desc    Request to perform a task
// @route   POST /api/tasks/:id/request
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
  try {
    // console.log("we are at request route ",req.params.id);
    const task = await Task.findById(req.params.id);
    // console.log("printing task ",task);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is not open for requests' });
    }

    if (task.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request your own task' });
    }

    if (task.requestedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already requested this task' });
    }

   
      task.requestedBy.push(req.user._id);
      console.log("task save ho gaya", req.user._id, "me");

      await task.save(); // this is where it's failing

      console.log("kunj bhadwe kuch kar le");
     
   

    // Create notification for task creator
  
      await Notification.create({
        user: task.createdBy,
        type: "task",
        message: `${req.user.name} has requested to perform your task: ${task.title}`,
        relatedTo: task._id,
        relatedModel: "Task",
      });
      console.log("notification create ho gya");
  
    

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('requestedBy', 'name avatar');
      console.log("task bhi populate ho gya ");

    // Emit socket event
    
      const io = req.app.get("io");
      io.emit("taskUpdated", populatedTask);
      console.log("KUNJ LODU LALIT ")
      // console.log("ye hamara populated task hai ", populatedTask);
   

   return res.json(populatedTask);
  } catch (err) {
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


// @desc    Complete task
// @route   POST /api/tasks/:id/complete
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (task.status !== 'assigned') {
      return res.status(400).json({ message: 'Task cannot be completed' });
    }

    // Transfer credits from escrow to performer
    const performer = await User.findById(task.assignedTo);
    performer.creditBalance += task.escrowAmount;
    task.escrowAmount = 0;
    task.status = 'completed';
    task.completedAt = Date.now();

    await Promise.all([performer.save(), task.save()]);

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { task: task._id, type: 'task_payment' },
      { status: 'completed' }
    );

    // Create notifications
    await Promise.all([
      Notification.create({
        user: task.createdBy,
        type: 'task',
        message: `Your task "${task.title}" has been completed`,
        relatedTo: task._id,
        relatedModel: 'Task'
      }),
      Notification.create({
        user: task.assignedTo,
        type: 'credit',
        message: `You received ${task.credits} credits for completing the task: ${task.title}`,
        relatedTo: task._id,
        relatedModel: 'Task'
      })
    ]);

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('requestedBy', 'name avatar');

    // Emit socket event
    req.app.get('io').emit('taskUpdated', populatedTask);

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post("/:id/confirm-completion", protect, async (req, res) => {
  try {
    console.log("we are at confirm completion ",req.params.id)
    const task = await Task.findById(req.params.id);
    console.log("task at confirm completion ",task);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "assigned") {
      return res.status(400).json({ message: "Task cannot be confirmed" });
    }

    // Check if user is either creator or performer
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isPerformer = task.assignedTo.toString() === req.user._id.toString();

    if (!isCreator && !isPerformer) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update confirmation status
    if (isCreator) {
      task.completionConfirmation.creator = true;
    } else {
      task.completionConfirmation.performer = true;
    }

    // Check if both parties have confirmed
    if (
      task.completionConfirmation.creator &&
      task.completionConfirmation.performer
    ) {
      // Transfer credits from escrow to performer
      const performer = await User.findById(task.assignedTo);
      performer.creditBalance += task.escrowAmount;
      task.escrowAmount = 0;
      task.status = "completed";
      task.completedAt = Date.now();

      await Promise.all([performer.save(), task.save()]);

      // Update transaction status
      await Transaction.findOneAndUpdate(
        { task: task._id, type: "task_payment" },
        { status: "completed" }
      );

      // Create notifications
      await Promise.all([
        Notification.create({
          user: task.createdBy,
          type: "task",
          message: `Task "${task.title}" has been completed`,
          relatedTo: task._id,
          relatedModel: "Task",
        }),
        Notification.create({
          user: task.assignedTo,
          type: "credit",
          message: `You received ${task.credits} credits for completing the task: ${task.title}`,
          relatedTo: task._id,
          relatedModel: "Task",
        }),
      ]);
    } else {
      await task.save();

      // Create notification for the other party
      const otherParty = isCreator ? task.assignedTo : task.createdBy;
      await Notification.create({
        user: otherParty,
        type: "task",
        message: `${req.user.name} has confirmed completion of task: ${task.title}. Please confirm from your side.`,
        relatedTo: task._id,
        relatedModel: "Task",
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .populate("requestedBy", "name avatar");

    // Emit socket event
    req.app.get("io").emit("taskUpdated", populatedTask);

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
