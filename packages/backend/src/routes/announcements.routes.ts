import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { createAnnouncementController, listAnnouncementsController } from "../controllers/announcements.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAnnouncementsController);
router.post("/", requireAuth, requireRole("COACH"), createAnnouncementController);

export default router;
