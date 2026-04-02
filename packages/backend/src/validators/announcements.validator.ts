import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export function validateCreateAnnouncement(data: unknown) {
  const result = createAnnouncementSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation error";
    throw new Error(message);
  }
  return result.data;
}
