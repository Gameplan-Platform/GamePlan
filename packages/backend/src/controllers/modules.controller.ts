import { Request, Response } from "express";
import { validateCreateModule } from "../validators/modules.validator";
import { createModule, listMyModules } from "../services/modules.service";

export async function createModuleController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description } = validateCreateModule(req.body);
    const module = await createModule(req.user.userId, name, description);

    return res.status(201).json({
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Module name is required" || message === "Description must be a string") {
      return res.status(400).json({ error: message });
    }

    console.error("Create module error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listMyModulesController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const modules = await listMyModules(req.user.userId);

    return res.status(200).json({ modules });
  } catch (error) {
    console.error("List modules error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}