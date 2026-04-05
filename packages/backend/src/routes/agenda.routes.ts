import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createAgendaController,
  getAgendaController,
  updateAgendaController,
  listAgendasController,
  likeAgendaController,
  unlikeAgendaController,
  deleteAgendaController,
} from "../controllers/agenda.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listAgendasController);
router.post("/", requireAuth, createAgendaController);
router.get("/:agendaId", requireAuth, getAgendaController);
router.patch("/:agendaId", requireAuth, updateAgendaController);
router.post("/:agendaId/like", requireAuth, likeAgendaController);
router.delete("/:agendaId/like", requireAuth, unlikeAgendaController);
router.delete("/:agendaId", requireAuth, deleteAgendaController);
router.patch("/:agendaId", requireAuth, updateAgendaController);

export default router;
