import prisma from "../lib/prisma";

async function getMembership(userId: string, moduleId: string) {
  return prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
}

export async function listGoals(
  userId: string,
  moduleId: string,
  athleteIdFilter?: string
) {
  const membership = await getMembership(userId, moduleId);
  if (!membership) throw new Error("Not a member of this module");

  const isCoach = membership.memberRole === "MODULE_ADMIN";

  // Athletes can only see their own goals; coaches can optionally filter by athlete.
  const athleteId = isCoach ? athleteIdFilter : userId;

  return prisma.goal.findMany({
    where: {
      moduleId,
      ...(athleteId ? { athleteId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createGoal(
  coachId: string,
  moduleId: string,
  athleteId: string,
  title: string
) {
  const membership = await getMembership(coachId, moduleId);
  if (!membership) throw new Error("Not a member of this module");
  if (membership.memberRole !== "MODULE_ADMIN") throw new Error("Not authorized");

  const athleteMembership = await getMembership(athleteId, moduleId);
  if (!athleteMembership) throw new Error("Athlete is not a member of this module");

  return prisma.goal.create({
    data: { title, moduleId, athleteId, createdById: coachId },
  });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: { title?: string; completed?: boolean }
) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new Error("Goal not found");

  const membership = await getMembership(userId, goal.moduleId);
  if (!membership) throw new Error("Not authorized");

  const isCoach = membership.memberRole === "MODULE_ADMIN";
  const isOwner = goal.athleteId === userId;

  // Title edits are coach-only. Completion toggles are allowed for the athlete
  // the goal belongs to, or any coach in the module.
  if (data.title !== undefined && !isCoach) throw new Error("Not authorized");
  if (data.completed !== undefined && !isCoach && !isOwner) throw new Error("Not authorized");

  return prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.completed !== undefined ? { completed: data.completed } : {}),
    },
  });
}

export async function deleteGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new Error("Goal not found");

  const membership = await getMembership(userId, goal.moduleId);
  if (!membership || membership.memberRole !== "MODULE_ADMIN") {
    throw new Error("Not authorized");
  }

  await prisma.goal.delete({ where: { id: goalId } });
}
