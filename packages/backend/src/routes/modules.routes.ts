import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createModuleController,
  listMyModulesController,
  joinModuleController,
  getModuleNavigationController,
} from "../controllers/modules.controller";

const router = Router();

router.get("/", requireAuth, listMyModulesController);
router.post("/", requireAuth, requireRole("COACH"), createModuleController);
router.post("/join", requireAuth, requireRole("COACH", "ATHLETE", "PARENT"), joinModuleController);
router.get("/:id/navigation", requireAuth, getModuleNavigationController);

export default router;