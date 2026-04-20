import prisma from "../lib/prisma";

type DeductionInput = {
  category: string;
  value: number;
  notes?: string;
};

async function getMembership(userId: string, moduleId: string) {
  return prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
}

function parseDate(value: string): Date {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) throw new Error("Invalid date format");
  return parsed;
}

export async function listRoutines(
  userId: string,
  moduleId: string,
  athleteIdFilter?: string
) {
  const membership = await getMembership(userId, moduleId);
  if (!membership) throw new Error("Not a member of this module");

  const isCoach = membership.memberRole === "MODULE_ADMIN";
  const athleteId = isCoach ? athleteIdFilter : userId;

  return prisma.routine.findMany({
    where: {
      moduleId,
      ...(athleteId ? { athleteId } : {}),
    },
    orderBy: { date: "desc" },
    include: { deductions: true },
  });
}

export async function getRoutine(userId: string, routineId: string) {
  const routine = await prisma.routine.findUnique({
    where: { id: routineId },
    include: { deductions: true },
  });
  if (!routine) throw new Error("Routine not found");

  const membership = await getMembership(userId, routine.moduleId);
  if (!membership) throw new Error("Not authorized");

  const isCoach = membership.memberRole === "MODULE_ADMIN";
  const isOwner = routine.athleteId === userId;
  if (!isCoach && !isOwner) throw new Error("Not authorized");

  return routine;
}

export async function createRoutine(
  coachId: string,
  moduleId: string,
  input: {
    title: string;
    date: string;
    athleteId: string;
    notes?: string;
    deductions?: DeductionInput[];
  }
) {
  const membership = await getMembership(coachId, moduleId);
  if (!membership) throw new Error("Not a member of this module");
  if (membership.memberRole !== "MODULE_ADMIN") throw new Error("Not authorized");

  const athleteMembership = await getMembership(input.athleteId, moduleId);
  if (!athleteMembership) throw new Error("Athlete is not a member of this module");

  const date = parseDate(input.date);

  return prisma.routine.create({
    data: {
      title: input.title,
      date,
      notes: input.notes,
      moduleId,
      athleteId: input.athleteId,
      createdById: coachId,
      deductions: input.deductions && input.deductions.length > 0
        ? { create: input.deductions }
        : undefined,
    },
    include: { deductions: true },
  });
}

export async function updateRoutine(
  userId: string,
  routineId: string,
  data: {
    title?: string;
    date?: string;
    notes?: string | null;
    deductions?: DeductionInput[];
  }
) {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine) throw new Error("Routine not found");

  const membership = await getMembership(userId, routine.moduleId);
  if (!membership || membership.memberRole !== "MODULE_ADMIN") {
    throw new Error("Not authorized");
  }

  return prisma.$transaction(async tx => {
    const updated = await tx.routine.update({
      where: { id: routineId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.date !== undefined ? { date: parseDate(data.date) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    if (data.deductions !== undefined) {
      await tx.deduction.deleteMany({ where: { routineId } });
      if (data.deductions.length > 0) {
        await tx.deduction.createMany({
          data: data.deductions.map(d => ({ ...d, routineId })),
        });
      }
    }

    return tx.routine.findUnique({
      where: { id: routineId },
      include: { deductions: true },
    });
  });
}

export async function deleteRoutine(userId: string, routineId: string) {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine) throw new Error("Routine not found");

  const membership = await getMembership(userId, routine.moduleId);
  if (!membership || membership.memberRole !== "MODULE_ADMIN") {
    throw new Error("Not authorized");
  }

  await prisma.routine.delete({ where: { id: routineId } });
}
