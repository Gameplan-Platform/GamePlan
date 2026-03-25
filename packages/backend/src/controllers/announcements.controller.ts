import { Request, Response } from "express";
type ModuleParams = { moduleId: string };
import { validateCreateAnnouncement } from "../validators/announcements.validator";
import { createAnnouncement, listAnnouncements } from "../services/announcements.service";

export async function createAnnouncementController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const { title, body } = validateCreateAnnouncement(req.body);

    const announcement = await createAnnouncement(req.user.userId, moduleId, title, body);

    return res.status(201).json({ announcement });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Title is required" || message === "Body is required") {
      return res.status(400).json({ error: message });
    }
    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("Create announcement error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listAnnouncementsController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const announcements = await listAnnouncements(req.user.userId, moduleId);

    return res.status(200).json({ announcements });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("List announcements error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
