import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { selectRole } from "../controllers/user.controller";

const router = Router();

router.patch("/role", requireAuth, selectRole);

export default router;