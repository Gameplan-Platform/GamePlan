import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createEventController,
  listEventsController,
  getEventController,
  deleteEventController,
  editEventController,
} from "../controllers/events.controller";

const router = Router();

router.get("/module/:moduleId", requireAuth, listEventsController);
router.get("/:id", requireAuth, getEventController);
router.post("/", requireAuth, requireRole("COACH"), createEventController);
router.delete("/:id", requireAuth, deleteEventController);
router.patch("/:id", requireAuth, requireRole("COACH"), editEventController);

export default router;
