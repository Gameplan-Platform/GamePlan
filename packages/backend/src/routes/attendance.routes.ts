import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getModuleAttendance, saveModuleAttendance, getMemberAttendance } from "../controllers/attendance.controller";

const router = Router();

router.get("/:moduleId/attendance", requireAuth, getModuleAttendance);
router.get("/:moduleId/members/:memberId/attendance", requireAuth, getMemberAttendance);
router.put("/:moduleId/attendance", requireAuth, saveModuleAttendance);

export default router;
