import { Router } from "express";
// ✅ Import the new middleware
import { auth, adminOrBuilderOnly } from "../middleware/auth.js";
import {
  createTask,
  listTasksForSite,
  listTasksForFloor,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(auth);

// GET routes are fine for all roles (they are already filtered by the controller)
router.get("/site/:siteId", listTasksForSite);
router.get("/site/:siteId/floor/:floorId", listTasksForFloor);

// ✅ Protect create, update, and delete actions
router.post("/", adminOrBuilderOnly, upload.single('image'), createTask);
router.patch("/:taskId/status", adminOrBuilderOnly, updateTaskStatus);
router.delete("/:id", adminOrBuilderOnly, deleteTask);

export default router;