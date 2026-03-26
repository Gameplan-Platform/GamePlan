import { Request, Response } from "express";
type ModuleParams = { moduleId: string };
import { validateCreateAgenda } from "../validators/agenda.validator";
import { createAgenda, listAgendas } from "../services/agenda.service";

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
    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("Create agenda error:", error);
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
