import { z } from "zod";

const createScoreSchema = z.object({
  athleteId: z.string().min(1, "Athlete ID is required"),
  score: z.number({ error: "Score is required" }),
  deductions: z.number().min(0, "Deductions cannot be negative").default(0),
  date: z.string().min(1, "Date is required"),
  eventName: z.string().optional(),
  notes: z.string().optional(),
});

const updateScoreSchema = z.object({
  score: z.number().optional(),
  deductions: z.number().min(0, "Deductions cannot be negative").optional(),
  date: z.string().optional(),
  eventName: z.string().optional(),
  notes: z.string().optional(),
});

export function validateCreateScore(data: unknown) {
  const result = createScoreSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}

export function validateUpdateScore(data: unknown) {
  const result = updateScoreSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}
