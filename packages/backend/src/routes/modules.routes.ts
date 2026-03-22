import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createModuleController,
  listMyModulesController,
  deleteModuleController,
  updateModuleController,
  joinModuleController,
  getModuleNavigationController,
  getModuleInfoController,
} from "../controllers/modules.controller";

const router = Router();

router.get("/", requireAuth, listMyModulesController);

// IMPORTANT: specific routes first
router.get("/:id/navigation", requireAuth, getModuleNavigationController);
router.get("/:id", requireAuth, getModuleInfoController);

router.post("/", requireAuth, requireRole("COACH"), createModuleController);
router.post("/join", requireAuth, requireRole("COACH", "ATHLETE", "PARENT"), joinModuleController);

router.patch("/:id", requireAuth, updateModuleController);
router.delete("/:id", requireAuth, deleteModuleController);

export default router;