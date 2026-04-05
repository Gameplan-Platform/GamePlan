import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createAnnouncementController,
  getAnnouncementController,
  listAnnouncementsController,
  likeAnnouncementController,
  unlikeAnnouncementController,
  deleteAnnouncementController,
  updateAnnouncementController,
} from "../controllers/announcements.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAnnouncementsController);
router.post("/", requireAuth, createAnnouncementController);
router.get("/:announcementId", requireAuth, getAnnouncementController);
router.post("/:announcementId/like", requireAuth, likeAnnouncementController);
router.delete("/:announcementId/like", requireAuth, unlikeAnnouncementController);
router.delete("/:announcementId", requireAuth, deleteAnnouncementController);
router.patch("/:announcementId", requireAuth, updateAnnouncementController);

export default router;
