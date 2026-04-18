import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  athleteId: z.string().min(1, "Athlete ID is required"),
  dueDate: z.string().datetime({ offset: true }).optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

export function validateCreateGoal(data: unknown) {
  const result = createGoalSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}

export function validateUpdateGoal(data: unknown) {
  const result = updateGoalSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}
