import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createModuleController,
  listMyModulesController,
  deleteModuleController,
  updateModuleController,
} from "../controllers/modules.controller";

const router = Router();

router.get("/", requireAuth, listMyModulesController);
router.post("/", requireAuth, requireRole("COACH"), createModuleController);
router.patch("/:id", requireAuth, updateModuleController);
router.delete("/:id", requireAuth, deleteModuleController);

export default router;