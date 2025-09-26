import mongoose from 'mongoose';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Site } from '../models/Site.js';
import { Task } from '../models/Task.js';

const serializeSite = (s) => ({
  id: s._id.toString(),
  name: s.name,
  address: s.address,
  floors: s.floors,
  flatsPerFloor: s.flatsPerFloor,
  status: s.status,
  activeTasks: s.activeTasks || 0,
  completedTasks: s.completedTasks || 0,
  createdBy: s.createdBy?.toString() || null
});

let bucketCache = null;
const getBucket = async () => {
  if (bucketCache) return bucketCache;
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
  const db = client.db(dbName);
  bucketCache = new GridFSBucket(db, { bucketName: 'uploads' });
  return bucketCache;
};

// ---------------- CREATE SITE ----------------
export const createSite = async (req, res) => {
  try {
    const { name, address, floors, flatsPerFloor } = req.body;
    const site = await Site.create({
      name,
      address,
      floors,
      flatsPerFloor,
      createdBy: req.user.id
    });
    res.status(201).json(serializeSite(site));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ---------------- LIST SITES ----------------
// controllers/site.controller.js

export const listSites = async (req, res) => {
  try {
    const { role } = req.user;
    let sites = [];

    // If user is an Admin or Builder, fetch all sites
    if (role === 'admin' || role === 'builder') {
      sites = await Site.find({}).sort({ createdAt: -1 });
    } else {
      // If user is a Worker, find only the sites where they have tasks
      const siteIdsWithTasks = await Task.distinct("site", {
        category: { $in: [role, 'general'] }
      });
      sites = await Site.find({ '_id': { $in: siteIdsWithTasks } }).sort({ createdAt: -1 });
    }

    // If no sites are relevant to the user, return an empty array
    if (sites.length === 0) {
      return res.json([]);
    }

    // ✅ This logic is now improved to show correct task counts for workers
    const siteIds = sites.map(s => s._id);
    const matchQuery = { site: { $in: siteIds } };

    // If the user is a worker, add their category to the task count query
    if (role !== 'admin' && role !== 'builder') {
        matchQuery.category = { $in: [role, 'general'] };
    }

    const agg = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: { site: "$site", status: "$status" }, count: { $sum: 1 } } }
    ]);

    const counts = {};
    for (const row of agg) {
      const siteId = row._id.site.toString();
      counts[siteId] ??= { active: 0, completed: 0 };
      if (row._id.status === "completed") {
        counts[siteId].completed = row.count;
      } else {
        counts[siteId].active += row.count;
      }
    }

    res.json(
      sites.map(s => ({
        ...serializeSite(s),
        activeTasks: counts[s._id]?.active || 0,
        completedTasks: counts[s._id]?.completed || 0
      }))
    );
  } catch (err) {
    console.error("List sites failed:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET SITE ----------------
export const getSite = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ message: "Site not found" });
    res.json(serializeSite(site));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE SITE ----------------
export const deleteSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: "Site not found" });

    const tasks = await Task.find({ site: site._id });
    const bucket = await getBucket();
    for (const task of tasks) {
      if (task.imageFileId) {
        try {
          await bucket.delete(new ObjectId(task.imageFileId));
        } catch (e) {
          console.warn(`Failed to delete image ${task.imageFileId}:`, e.message);
        }
      }
    }

    await Task.deleteMany({ site: site._id });
    res.json({ message: "Site and all related tasks deleted", id: site._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};