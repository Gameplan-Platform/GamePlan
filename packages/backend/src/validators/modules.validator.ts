export type CreateModuleInput = {
  name: string;
  description?: string;
};

export function validateCreateModule(data: Record<string, unknown>): CreateModuleInput {
  const { name, description } = data;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Module name is required");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  return {
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : undefined,
  };
}