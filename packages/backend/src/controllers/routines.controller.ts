import { Request, Response } from "express";
import {
  listRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../services/routines.service";
import {
  validateCreateRoutine,
  validateUpdateRoutine,
} from "../validators/routines.validator";

function handleError(res: Response, error: unknown, context: string) {
  const message = error instanceof Error ? error.message : "Internal server error";

  if (message === "Routine not found") return res.status(404).json({ error: message });
  if (message === "Invalid date format") return res.status(400).json({ error: message });
  if (
    message === "Not a member of this module" ||
    message === "Not authorized" ||
    message === "Athlete is not a member of this module"
  ) {
    return res.status(403).json({ error: message });
  }

  console.error(`${context} error:`, error);
  return res.status(500).json({ error: "Internal server error" });
}

export async function listRoutinesController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });

    const athleteIdFilter = typeof req.query.athleteId === "string" ? req.query.athleteId : undefined;

    const routines = await listRoutines(req.user.userId, moduleId as string, athleteIdFilter);
    return res.status(200).json(routines);
  } catch (error) {
    return handleError(res, error, "List routines");
  }
}

export async function getRoutineController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const routine = await getRoutine(req.user.userId, req.params.id as string);
    return res.status(200).json(routine);
  } catch (error) {
    return handleError(res, error, "Get routine");
  }
}

export async function createRoutineController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });

    const input = validateCreateRoutine(req.body);

    const routine = await createRoutine(req.user.userId, moduleId as string, input);
    return res.status(201).json({ message: "Routine created successfully", routine });
  } catch (error) {
    return handleError(res, error, "Create routine");
  }
}

export async function updateRoutineController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const data = validateUpdateRoutine(req.body);
    const routine = await updateRoutine(req.user.userId, req.params.id as string, data);

    return res.status(200).json({ message: "Routine updated successfully", routine });
  } catch (error) {
    return handleError(res, error, "Update routine");
  }
}

export async function deleteRoutineController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await deleteRoutine(req.user.userId, req.params.id as string);
    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error, "Delete routine");
  }
}
