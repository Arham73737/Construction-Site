import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    floors: { type: Number, required: true, min: 1 },
    flatsPerFloor: { type: Number, required: true, min: 1 },
    status: { type: String, default: "active" },
    activeTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Site = mongoose.model("Site", siteSchema);
