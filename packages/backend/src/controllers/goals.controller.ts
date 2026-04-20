import { Request, Response } from "express";
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../services/goals.service";
import { validateCreateGoal, validateUpdateGoal } from "../validators/goals.validator";

function handleError(res: Response, error: unknown, context: string) {
  const message = error instanceof Error ? error.message : "Internal server error";

  if (message === "Goal not found") return res.status(404).json({ error: message });
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

export async function listGoalsController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });

    const athleteIdFilter = typeof req.query.athleteId === "string" ? req.query.athleteId : undefined;

    const goals = await listGoals(req.user.userId, moduleId as string, athleteIdFilter);
    return res.status(200).json(goals);
  } catch (error) {
    return handleError(res, error, "List goals");
  }
}

export async function createGoalController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });

    const { title, athleteId } = validateCreateGoal(req.body);

    const goal = await createGoal(req.user.userId, moduleId as string, athleteId, title);
    return res.status(201).json({ message: "Goal created successfully", goal });
  } catch (error) {
    return handleError(res, error, "Create goal");
  }
}

export async function updateGoalController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const data = validateUpdateGoal(req.body);
    const goal = await updateGoal(req.user.userId, req.params.id as string, data);

    return res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    return handleError(res, error, "Update goal");
  }
}

export async function deleteGoalController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await deleteGoal(req.user.userId, req.params.id as string);
    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error, "Delete goal");
  }
}
