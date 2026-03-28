import prisma from "../lib/prisma";

export async function getModuleAttendanceForDate( moduleId: string, userId: string, date: string ) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      memberships: true,
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const membership = module.memberships.find(
    (m) => m.userId === userId
  );

  if (!membership) {
    throw new Error("Not authorized");
  }

  if (
    membership.memberRole !== "COACH" &&
    membership.memberRole !== "MODULE_ADMIN"
  ) {
    throw new Error("Not authorized");
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: module.memberships.map((m) => m.userId),
      },
    },
  });

  const attendance = await prisma.attendance.findMany({
    where: {
      moduleId,
      date: normalizedDate,
    },
  });

  const result = users.map((user) => {
    const record = attendance.find(
      (a) => a.memberId === user.id
    );

    return {
      memberId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      status: record ? record.status : null,
    };
  });

  return {
    moduleId,
    date: normalizedDate,
    members: result,
  };
}