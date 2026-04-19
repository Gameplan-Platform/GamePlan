import { z } from "zod";

const validDate = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), "Invalid date format");

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  athleteId: z.string().min(1, "Athlete ID is required"),
  dueDate: validDate.optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: validDate.nullable().optional(),
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
