import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createAgendaController,
  listAgendasController,
  likeAgendaController,
  unlikeAgendaController,
  deleteAgendaController,
} from "../controllers/agenda.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAgendasController);
router.post("/", requireAuth, createAgendaController);
router.post("/:agendaId/like", requireAuth, likeAgendaController);
router.delete("/:agendaId/like", requireAuth, unlikeAgendaController);
router.delete("/:agendaId", requireAuth, deleteAgendaController);

export default router;
