import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";

const router = Router(); // route container

router.get("/health", healthCheck); // health endpoint

export default router;
