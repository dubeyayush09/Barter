import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
    },
    skills: {
      type: [String],
      default: [],
    },
    credits: {
      type: Number,
      required: [true, "Credit amount is required"],
      min: [1, "Credit amount must be at least 1"],
    },
    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled", "disputed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    completedAt: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    dispute: {
      reason: {
        type: String,
      },
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      raisedAt: {
        type: Date,
      },
      resolved: {
        type: Boolean,
        default: false,
      },
      resolution: {
        type: String,
        enum: ["creator_favor", "performer_favor", "split"],
      },
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
TaskSchema.index({ status: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ assignedTo: 1 });

export default mongoose.model("Task", TaskSchema);
