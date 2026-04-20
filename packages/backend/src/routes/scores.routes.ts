import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  listScoresController,
  getScoreSummaryController,
  createScoreController,
  updateScoreController,
  deleteScoreController,
  getModuleAthletesController,
} from "../controllers/scores.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listScoresController);
router.get("/summary", requireAuth, getScoreSummaryController);
router.get("/athletes", requireAuth, getModuleAthletesController);
router.post("/", requireAuth, createScoreController);
router.patch("/:scoreId", requireAuth, updateScoreController);
router.delete("/:scoreId", requireAuth, deleteScoreController);

export default router;
