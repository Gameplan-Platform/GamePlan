import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createAgendaController,
  listAgendasController,
  likeAgendaController,
  unlikeAgendaController,
} from "../controllers/agenda.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAgendasController);
router.post("/", requireAuth, requireRole("COACH"), createAgendaController);
router.post("/:agendaId/like", requireAuth, likeAgendaController);
router.delete("/:agendaId/like", requireAuth, unlikeAgendaController);

export default router;
