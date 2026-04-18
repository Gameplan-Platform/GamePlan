import { Request, Response } from "express";
import { validateCreateGoal, validateUpdateGoal } from "../validators/goals.validator";
import { listGoals, getGoal, createGoal, updateGoal, deleteGoal } from "../services/goals.service";

type ModuleParams = { moduleId: string };
type GoalParams = { moduleId: string; goalId: string };

export async function listGoalsController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const athleteId = req.query.athleteId as string | undefined;

    const goals = await listGoals(moduleId, req.user.userId, athleteId);

    if (goals.length === 0) {
      return res.status(200).json({ goals, message: "No goals available" });
    }

    return res.status(200).json({ goals });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module") return res.status(403).json({ error: message });
    console.error("List goals error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getGoalController(req: Request<GoalParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, goalId } = req.params;
    const goal = await getGoal(moduleId, goalId, req.user.userId);

    return res.status(200).json({ goal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Goal not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Not authorized") {
      return res.status(403).json({ error: message });
    }
    console.error("Get goal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createGoalController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const data = validateCreateGoal(req.body);

    const goal = await createGoal(moduleId, req.user.userId, data);

    return res.status(201).json({ goal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Title is required" || message === "Athlete ID is required") {
      return res.status(400).json({ error: message });
    }
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Athlete not found in this module") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can assign goals") {
      return res.status(403).json({ error: message });
    }
    console.error("Create goal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateGoalController(req: Request<GoalParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, goalId } = req.params;
    const data = validateUpdateGoal(req.body);

    const goal = await updateGoal(moduleId, goalId, req.user.userId, data);

    return res.status(200).json({ goal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Title cannot be empty") return res.status(400).json({ error: message });
    if (message === "Athletes can only update goal completion status") {
      return res.status(400).json({ error: message });
    }
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Goal not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Not authorized") {
      return res.status(403).json({ error: message });
    }
    console.error("Update goal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteGoalController(req: Request<GoalParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, goalId } = req.params;
    await deleteGoal(moduleId, goalId, req.user.userId);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Goal not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can delete goals") {
      return res.status(403).json({ error: message });
    }
    console.error("Delete goal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
