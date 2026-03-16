import { Request, Response } from "express";
import { validateCreateModule } from "../validators/modules.validator";
import { createModule, joinModule, listMyModules } from "../services/modules.service";

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

export async function joinModuleController(req: Request, res: Response){
  try{
    if (!req.user){
      return res.status(401).json({ error: "Unauthorized"});
    }

    const { joinCode } = req.body;

    if (!joinCode || typeof joinCode !== "string") {
      return res.status(400).json({ error: "Join code is required."});
    }

    const result = await joinModule(req.user.userId, joinCode, req.user.role);

    return res.status(201).json({
      message: "Successfully joined module",
      module: result.module,
      membership: result.membership,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message == "Invalid join code") {
      return res.status(404).json({ error: message });
    }

    if (message === "Already a member") {
      return res.status(409).json({ error: message });
    }

    console.error("Join module error:", error);
    return res.status(500).json({ error: "Internal server error"});
  }
}