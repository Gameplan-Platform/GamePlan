import { Request, Response } from "express";
import { validateCreateScore, validateUpdateScore } from "../validators/scores.validator";
import {
  listScores,
  getScoreSummary,
  createScore,
  updateScore,
  deleteScore,
  getModuleAthletes,
} from "../services/scores.service";

type ModuleParams = { moduleId: string };
type ScoreParams = { moduleId: string; scoreId: string };

export async function listScoresController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const athleteId = req.query.athleteId as string | undefined;

    const scores = await listScores(moduleId, req.user.userId, athleteId);
    return res.status(200).json({ scores });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module") return res.status(403).json({ error: message });
    console.error("List scores error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getScoreSummaryController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const athleteId = req.query.athleteId as string | undefined;

    const data = await getScoreSummary(moduleId, req.user.userId, athleteId);

    if (!data.summary) {
      return res.status(200).json({
        ...data,
        message: "Not enough data to generate a chart",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Athlete not found in this module") return res.status(404).json({ error: message });
    if (message === "Not a member of this module") return res.status(403).json({ error: message });
    console.error("Score summary error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createScoreController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const data = validateCreateScore(req.body);

    const score = await createScore(moduleId, req.user.userId, data);
    return res.status(201).json({ score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Athlete ID is required" || message === "Score is required" || message === "Deductions cannot be negative" || message === "Date is required") {
      return res.status(400).json({ error: message });
    }
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Athlete not found in this module") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can record scores") {
      return res.status(403).json({ error: message });
    }
    console.error("Create score error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateScoreController(req: Request<ScoreParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, scoreId } = req.params;
    const data = validateUpdateScore(req.body);

    const score = await updateScore(moduleId, scoreId, req.user.userId, data);
    return res.status(200).json({ score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Deductions cannot be negative") return res.status(400).json({ error: message });
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Score not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can update scores") {
      return res.status(403).json({ error: message });
    }
    console.error("Update score error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteScoreController(req: Request<ScoreParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, scoreId } = req.params;
    await deleteScore(moduleId, scoreId, req.user.userId);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Score not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can delete scores") {
      return res.status(403).json({ error: message });
    }
    console.error("Delete score error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getModuleAthletesController(req: Request<ModuleParams>, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;
    const athletes = await getModuleAthletes(moduleId, req.user.userId);

    return res.status(200).json({ athletes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Module not found") return res.status(404).json({ error: message });
    if (message === "Not a member of this module" || message === "Only coaches can list athletes") {
      return res.status(403).json({ error: message });
    }
    console.error("Get athletes error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
