import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  listGoalsController,
  getGoalController,
  createGoalController,
  updateGoalController,
  deleteGoalController,
} from "../controllers/goals.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listGoalsController);
router.post("/", requireAuth, createGoalController);
router.get("/:goalId", requireAuth, getGoalController);
router.patch("/:goalId", requireAuth, updateGoalController);
router.delete("/:goalId", requireAuth, deleteGoalController);

export default router;
