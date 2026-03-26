import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { createAgendaController, listAgendasController } from "../controllers/agenda.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAgendasController);
router.post("/", requireAuth, requireRole("COACH"), createAgendaController);

export default router;
