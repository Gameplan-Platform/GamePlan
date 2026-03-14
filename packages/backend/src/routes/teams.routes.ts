import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.status(200).json({
    message: "Protected teams route",
    user: req.user,
  });
});

export default router;