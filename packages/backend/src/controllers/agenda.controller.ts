import { Request, Response } from "express";
type ModuleParams = { moduleId: string };
type AgendaParams = { moduleId: string; agendaId: string };
import { validateCreateAgenda } from "../validators/agenda.validator";
import { createAgenda, getAgenda, listAgendas, likeAgenda, unlikeAgenda, deleteAgenda, updateAgenda } from "../services/agenda.service";

export async function createAgendaController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const { title, description, date } = validateCreateAgenda(req.body);

    const agenda = await createAgenda(req.user.userId, moduleId, title, description, date);

    return res.status(201).json({ agenda });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Title is required" || message === "Date is required") {
      return res.status(400).json({ error: message });
    }
    if (message === "Not a member of this module" || message === "Only module admins can create agenda items") {
      return res.status(403).json({ error: message });
    }

    console.error("Create agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAgendaController(req: Request<AgendaParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { moduleId, agendaId } = req.params;
    const agenda = await getAgenda(req.user.userId, moduleId, agendaId);
    return res.status(200).json({ agenda });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Not a member of this module") return res.status(403).json({ error: message });
    if (message === "Agenda not found") return res.status(404).json({ error: message });
    console.error("Get agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listAgendasController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const agendas = await listAgendas(req.user.userId, moduleId);

    return res.status(200).json({ agendas });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("List agendas error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function likeAgendaController(req: Request<AgendaParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, agendaId } = req.params;
    await likeAgenda(req.user.userId, moduleId, agendaId);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }
    if (message === "Agenda not found") {
      return res.status(404).json({ error: message });
    }

    console.error("Like agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function unlikeAgendaController(req: Request<AgendaParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, agendaId } = req.params;
    await unlikeAgenda(req.user.userId, moduleId, agendaId);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("Unlike agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAgendaController(req: Request<AgendaParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { moduleId, agendaId } = req.params;
    const { title, description, date } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    const agenda = await updateAgenda(req.user.userId, moduleId, agendaId, title, description, date);
    return res.status(200).json({ agenda });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Not a member of this module" || message === "Only module admins can edit agenda items") return res.status(403).json({ error: message });
    if (message === "Agenda not found") return res.status(404).json({ error: message });
    console.error("Update agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteAgendaController(req: Request<AgendaParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, agendaId } = req.params;
    await deleteAgenda(req.user.userId, moduleId, agendaId);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }
    if (message === "Only module admins can delete agenda items") {
      return res.status(403).json({ error: message });
    }
    if (message === "Agenda not found") {
      return res.status(404).json({ error: message });
    }

    console.error("Delete agenda error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

