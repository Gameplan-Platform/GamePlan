import prisma from "../lib/prisma";

async function getModuleAndMembership(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { memberships: true },
  });

  if (!module) throw new Error("Module not found");

  const membership = module.memberships.find((m) => m.userId === userId);
  if (!membership) throw new Error("Not a member of this module");

  return { module, membership };
}

function isCoachOrAdmin(role: string) {
  return role === "COACH" || role === "MODULE_ADMIN";
}

export async function listGoals(moduleId: string, requesterId: string, athleteId?: string) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  if (isCoachOrAdmin(membership.memberRole)) {
    // Coaches/admins can list all goals in the module, optionally filtered by athlete
    const where = athleteId
      ? { moduleId, athleteId }
      : { moduleId };

    const goals = await prisma.goal.findMany({
      where,
      include: {
        athlete: { select: { id: true, firstName: true, lastName: true } },
        assignedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return goals;
  }

  // Athletes can only see their own goals
  const goals = await prisma.goal.findMany({
    where: { moduleId, athleteId: requesterId },
    include: {
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return goals;
}

export async function getGoal(moduleId: string, goalId: string, requesterId: string) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, moduleId },
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!goal) throw new Error("Goal not found");

  // Athletes can only view goals assigned to them
  if (!isCoachOrAdmin(membership.memberRole) && goal.athleteId !== requesterId) {
    throw new Error("Not authorized");
  }

  return goal;
}

export async function createGoal(
  moduleId: string,
  requesterId: string,
  data: { title: string; description?: string; athleteId: string; dueDate?: string }
) {
  const { module, membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can assign goals");
  }

  // Verify the athlete is a MEMBER of this module
  const athleteMembership = module.memberships.find((m) => m.userId === data.athleteId);
  if (!athleteMembership || athleteMembership.memberRole !== "MEMBER") {
    throw new Error("Athlete not found in this module");
  }

  const goal = await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      athleteId: data.athleteId,
      assignedById: requesterId,
      moduleId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return goal;
}

export async function updateGoal(
  moduleId: string,
  goalId: string,
  requesterId: string,
  data: { title?: string; description?: string; completed?: boolean; dueDate?: string | null }
) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, moduleId },
  });

  if (!goal) throw new Error("Goal not found");

  const coachOrAdmin = isCoachOrAdmin(membership.memberRole);

  // Athletes can only update the completion status of their own goals
  if (!coachOrAdmin) {
    if (goal.athleteId !== requesterId) throw new Error("Not authorized");

    const { completed } = data;
    if (Object.keys(data).some((k) => k !== "completed")) {
      throw new Error("Athletes can only update goal completion status");
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: { completed },
      include: {
        athlete: { select: { id: true, firstName: true, lastName: true } },
        assignedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return updated;
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return updated;
}

export async function deleteGoal(moduleId: string, goalId: string, requesterId: string) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can delete goals");
  }

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, moduleId },
  });

  if (!goal) throw new Error("Goal not found");

  await prisma.goal.delete({ where: { id: goalId } });
}
