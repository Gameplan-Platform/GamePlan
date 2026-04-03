import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createAnnouncementController,
  listAnnouncementsController,
  likeAnnouncementController,
  unlikeAnnouncementController,
  deleteAnnouncementController,
} from "../controllers/announcements.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAnnouncementsController);
router.post("/", requireAuth, createAnnouncementController);
router.post("/:announcementId/like", requireAuth, likeAnnouncementController);
router.delete("/:announcementId/like", requireAuth, unlikeAnnouncementController);
router.delete("/:announcementId", requireAuth, deleteAnnouncementController);

export default router;
