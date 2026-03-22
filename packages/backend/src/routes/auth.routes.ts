import { Router } from "express";
import { signup, login, verify, resend, me, bypassVerify } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verify);
router.post("/resend-verification", resend);
router.post("/bypass-verify", bypassVerify);
router.get("/me", requireAuth, me);

export default router;

 