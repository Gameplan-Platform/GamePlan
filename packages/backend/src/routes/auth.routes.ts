import { Router } from "express";
import { signup, login, verify, resend } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verify);
router.post("/resend-verification", resend);

export default router;

 