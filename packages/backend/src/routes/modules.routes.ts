import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { getModuleAttendance, saveModuleAttendance } from "../controllers/attendance.controller";
import {
  createModuleController,
  listMyModulesController,
  deleteModuleController,
  updateModuleController,
  joinModuleController,
  getModuleInfoController,
} from "../controllers/modules.controller";

const router = Router();

router.get("/", requireAuth, listMyModulesController);
router.get("/:id", requireAuth, getModuleInfoController);
router.get("/:moduleId/attendance", requireAuth, getModuleAttendance);
router.post("/", requireAuth, requireRole("COACH"), createModuleController);
router.post("/join", requireAuth, requireRole("COACH", "ATHLETE", "PARENT"), joinModuleController);
router.patch("/:id", requireAuth, updateModuleController);
router.put("/:moduleId/attendance", requireAuth, saveModuleAttendance);
router.delete("/:id", requireAuth, deleteModuleController);

export default router;
