import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [MessageSchema],
    lastMessage: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically update lastMessage date when new message is added
ChatSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    this.lastMessage = Date.now();
  }
  next();
});

export default mongoose.model("Chat", ChatSchema);
