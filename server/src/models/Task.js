import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
  floorId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  flat: { type: String, required: true },
  room: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['painter', 'plumber', 'carpenter', 'electrician', 'general'],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },
  imageFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "uploads.files",
    required: false,
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null
  },
  dateAssigned: { type: Date, default: Date.now }
}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);