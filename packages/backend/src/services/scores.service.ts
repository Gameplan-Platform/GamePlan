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

function computeTrend(scores: { score: number; date: Date }[]): "improving" | "declining" | "stable" | "insufficient_data" {
  if (scores.length < 3) return "insufficient_data";

  // Sort by date ascending
  const sorted = [...scores].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Simple linear regression slope
  const n = sorted.length;
  const xMean = (n - 1) / 2;
  const yMean = sorted.reduce((s, r) => s + r.score, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (sorted[i].score - yMean);
    denominator += (i - xMean) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;

  if (slope > 0.1) return "improving";
  if (slope < -0.1) return "declining";
  return "stable";
}

export async function listScores(moduleId: string, requesterId: string, athleteId?: string) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  const targetAthleteId = isCoachOrAdmin(membership.memberRole)
    ? (athleteId ?? undefined)
    : requesterId;

  const where = targetAthleteId
    ? { moduleId, athleteId: targetAthleteId }
    : { moduleId };

  return prisma.score.findMany({
    where,
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getScoreSummary(moduleId: string, requesterId: string, athleteId?: string) {
  const { module, membership } = await getModuleAndMembership(moduleId, requesterId);

  const targetAthleteId = isCoachOrAdmin(membership.memberRole)
    ? (athleteId ?? requesterId)
    : requesterId;

  // Verify the target athlete is in the module
  if (targetAthleteId !== requesterId) {
    const targetMembership = module.memberships.find((m) => m.userId === targetAthleteId);
    if (!targetMembership) throw new Error("Athlete not found in this module");
  }

  const [scores, goals] = await Promise.all([
    prisma.score.findMany({
      where: { moduleId, athleteId: targetAthleteId },
      include: {
        athlete: { select: { id: true, firstName: true, lastName: true } },
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.goal.findMany({
      where: { moduleId, athleteId: targetAthleteId },
    }),
  ]);

  const scoreValues = scores.map((s) => s.score);
  const deductionValues = scores.map((s) => s.deductions);

  const summary =
    scores.length === 0
      ? null
      : {
          count: scores.length,
          averageScore: scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length,
          averageDeductions: deductionValues.reduce((a, b) => a + b, 0) / deductionValues.length,
          highestScore: Math.max(...scoreValues),
          lowestScore: Math.min(...scoreValues),
          trend: computeTrend(scores.map((s) => ({ score: s.score, date: s.date }))),
        };

  const completedGoals = goals.filter((g) => g.completed).length;
  const goalCompletion = {
    total: goals.length,
    completed: completedGoals,
    percentage: goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100),
  };

  return { scores, summary, goalCompletion, athleteId: targetAthleteId };
}

export async function createScore(
  moduleId: string,
  requesterId: string,
  data: { athleteId: string; score: number; deductions: number; date: string; eventName?: string; notes?: string }
) {
  const { module, membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can record scores");
  }

  const athleteMembership = module.memberships.find((m) => m.userId === data.athleteId);
  if (!athleteMembership || athleteMembership.memberRole !== "MEMBER") {
    throw new Error("Athlete not found in this module");
  }

  return prisma.score.create({
    data: {
      moduleId,
      athleteId: data.athleteId,
      recordedById: requesterId,
      score: data.score,
      deductions: data.deductions,
      date: new Date(data.date),
      eventName: data.eventName,
      notes: data.notes,
    },
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function updateScore(
  moduleId: string,
  scoreId: string,
  requesterId: string,
  data: { score?: number; deductions?: number; date?: string; eventName?: string; notes?: string }
) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can update scores");
  }

  const existing = await prisma.score.findFirst({ where: { id: scoreId, moduleId } });
  if (!existing) throw new Error("Score not found");

  return prisma.score.update({
    where: { id: scoreId },
    data: {
      ...(data.score !== undefined && { score: data.score }),
      ...(data.deductions !== undefined && { deductions: data.deductions }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.eventName !== undefined && { eventName: data.eventName }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      athlete: { select: { id: true, firstName: true, lastName: true } },
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function deleteScore(moduleId: string, scoreId: string, requesterId: string) {
  const { membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can delete scores");
  }

  const existing = await prisma.score.findFirst({ where: { id: scoreId, moduleId } });
  if (!existing) throw new Error("Score not found");

  await prisma.score.delete({ where: { id: scoreId } });
}

export async function getModuleAthletes(moduleId: string, requesterId: string) {
  const { module, membership } = await getModuleAndMembership(moduleId, requesterId);

  if (!isCoachOrAdmin(membership.memberRole)) {
    throw new Error("Only coaches can list athletes");
  }

  const athleteMemberIds = module.memberships
    .filter((m) => m.memberRole === "MEMBER")
    .map((m) => m.userId);

  return prisma.user.findMany({
    where: { id: { in: athleteMemberIds } },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });
}
