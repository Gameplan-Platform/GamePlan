import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  listGoalsController,
  createGoalController,
  updateGoalController,
  deleteGoalController,
} from "../controllers/goals.controller";

const moduleScoped = Router({ mergeParams: true });
moduleScoped.get("/", requireAuth, listGoalsController);
moduleScoped.post("/", requireAuth, requireRole("COACH"), createGoalController);

const byId = Router();
byId.patch("/:id", requireAuth, updateGoalController);
byId.delete("/:id", requireAuth, requireRole("COACH"), deleteGoalController);

export { moduleScoped as goalsModuleRouter, byId as goalsByIdRouter };
