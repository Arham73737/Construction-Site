import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { Site } from "../models/Site.js";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const serializeTask = (t) => ({
  id: t._id.toString(),
  siteId: t.site.toString(),
  floorId: t.floorId,
  title: t.title,
  description: t.description,
  flat: t.flat,
  room: t.room,
  category: t.category,
  priority: t.priority,
  status: t.status,
  assignedBy: t.assignedBy?.toString() || null,
  dateAssigned: t.dateAssigned,
  imageFileId: t.imageFileId?.toString() || null,
  imageUrl: t.imageFileId ? `/api/files/${t.imageFileId}` : null
});

let bucketCache = null;
const getBucket = async () => {
    if (bucketCache) return bucketCache;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    bucketCache = new GridFSBucket(db, { bucketName: "uploads" });
    return bucketCache;
};


// ---------------- CREATE TASK ----------------
export const createTask = async (req, res) => {
  try {
    const { siteId, floorId, title, description, flat, room, category, priority } = req.body;

    if (!siteId || !floorId || !title || !description || !flat || !room || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    let imageFileId = null;

    // ✅ This block correctly saves an uploaded file to GridFS
    if (req.file) {
      const bucket = await getBucket();
      imageFileId = await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(req.file.originalname, {
          contentType: req.file.mimetype,
        });
        uploadStream.end(req.file.buffer);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });
    }

    const task = await Task.create({
      site: site._id,
      floorId,
      title,
      description,
      flat,
      room,
      category,
      priority: priority || "medium",
      status: "pending",
      imageFileId, // Save the file ID (or null)
      assignedBy: req.user?.id || null,
      dateAssigned: new Date(),
    });

    res.status(201).json(serializeTask(task));
  } catch (err) {
    console.error("Create task failed:", err);
    res.status(500).json({ message: err.message || "Server error during task creation." });
  }
};

const isWorkerRole = (role) => !['admin', 'builder'].includes(role);

// ---------------- LIST TASKS ----------------
export const listTasksForSite = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { role } = req.user;
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });
    const query = { site: new mongoose.Types.ObjectId(siteId) };
    if (isWorkerRole(role)) {
      query.category = { $in: [role, 'general'] };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks.map(serializeTask));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch site tasks", error: err.message });
  }
};

export const listTasksForFloor = async (req, res) => {
  try {
    let { siteId, floorId } = req.params;
    const { role } = req.user;
    if (!floorId.startsWith("floor-")) {
      floorId = `floor-${floorId}`;
    }
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });
    const query = { site: new mongoose.Types.ObjectId(siteId), floorId };
    if (isWorkerRole(role)) {
      query.category = { $in: [role, 'general'] };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks.map(serializeTask));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch floor tasks", error: err.message });
  }
};

// ---------------- UPDATE TASK STATUS ----------------
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(serializeTask(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE TASK ----------------
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.imageFileId) {
      try {
        const bucket = await getBucket();
        await bucket.delete(new ObjectId(task.imageFileId));
      } catch (err) {
        console.warn("Failed to delete image from GridFS:", err.message);
      }
    }
    res.json({ message: "Task deleted successfully", id: task._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};