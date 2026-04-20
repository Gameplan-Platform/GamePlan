import { z } from "zod";

const deductionInputSchema = z.object({
  category: z.string().min(1, "Deduction category is required"),
  value: z.number().finite("Deduction value must be a number"),
  notes: z.string().optional(),
});

const createRoutineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  athleteId: z.string().min(1, "Athlete ID is required"),
  notes: z.string().optional(),
  deductions: z.array(deductionInputSchema).optional(),
});

const updateRoutineSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    date: z.string().min(1, "Date cannot be empty").optional(),
    notes: z.string().nullable().optional(),
    deductions: z.array(deductionInputSchema).optional(),
  })
  .refine(
    data =>
      data.title !== undefined ||
      data.date !== undefined ||
      data.notes !== undefined ||
      data.deductions !== undefined,
    { message: "At least one field must be provided" }
  );

export function validateCreateRoutine(data: unknown) {
  const result = createRoutineSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}

export function validateUpdateRoutine(data: unknown) {
  const result = updateRoutineSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}
