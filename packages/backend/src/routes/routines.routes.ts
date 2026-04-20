import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  listRoutinesController,
  getRoutineController,
  createRoutineController,
  updateRoutineController,
  deleteRoutineController,
} from "../controllers/routines.controller";

const moduleScoped = Router({ mergeParams: true });
moduleScoped.get("/", requireAuth, listRoutinesController);
moduleScoped.post("/", requireAuth, requireRole("COACH"), createRoutineController);

const byId = Router();
byId.get("/:id", requireAuth, getRoutineController);
byId.patch("/:id", requireAuth, requireRole("COACH"), updateRoutineController);
byId.delete("/:id", requireAuth, requireRole("COACH"), deleteRoutineController);

export { moduleScoped as routinesModuleRouter, byId as routinesByIdRouter };
