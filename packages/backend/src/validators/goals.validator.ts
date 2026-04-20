import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  athleteId: z.string().min(1, "Athlete ID is required"),
});

const updateGoalSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    completed: z.boolean().optional(),
  })
  .refine(data => data.title !== undefined || data.completed !== undefined, {
    message: "At least one field must be provided",
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
