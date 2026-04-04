import { z } from "zod";

const createAgendaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export function validateCreateAgenda(data: unknown) {
  const result = createAgendaSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}
