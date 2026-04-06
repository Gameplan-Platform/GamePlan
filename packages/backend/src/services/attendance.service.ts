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
        in: module.memberships.filter((m) => m.memberRole === "MEMBER").map((m) => m.userId),
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

export async function saveModuleAttendanceForDate( moduleId: string, userId: string, date: string,
  records: { memberId: string; status: "PRESENT" | "ABSENT" }[]) {
    
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0,);
    
    if (Number.isNaN(normalizedDate.getTime())) {
        throw new Error("Invalid date");
    }

    const module = await prisma.module.findUnique({
        where: { id: moduleId }, 
        include: {
            memberships: true,
        },
    });

    if (!module) {
        throw new Error("Module now found");
    }

    const userMembership = module.memberships.find (
        (membership) => membership.userId === userId
    );

    if (!userMembership) {
        throw new Error("Not authorized");
    }

    if (userMembership.memberRole !== "COACH" && userMembership.memberRole !== "MODULE_ADMIN") {
        throw new Error("Not authorized");
    }

    const allowedMemberIds = new Set(
        module.memberships.filter((membership) => membership.memberRole === "MEMBER").map((membership) => membership.userId)
    );

    const processedMemberIds = new Set<string>();

    for (const record of records) {
        if (processedMemberIds.has(record.memberId)) {
            throw new Error("Duplicate memberId in request");
        }
        if (!allowedMemberIds.has(record.memberId)) {
            throw new Error("Member is not eligible for attendance");
        }
        processedMemberIds.add(record.memberId);
    }

    const savedAttendance = await prisma.$transaction(
        records.map((record) =>
            prisma.attendance.upsert({
                where: {
                    moduleId_memberId_date: {
                        moduleId,
                        memberId: record.memberId,
                        date: normalizedDate,
                    },
                },
                update: {
                    status: record.status,
                    markedById: userId,
                },
                create: {
                    moduleId,
                    memberId: record.memberId,
                    date: normalizedDate,
                    status: record.status,
                    markedById: userId,
                }
            })   
        )
    );
    
    return {
        moduleId,
        date: normalizedDate,
        records: savedAttendance,
    };
}

export async function getMemberAttendanceRecord(moduleId: string, memberId: string, userId: string) {
    const module = await prisma.module.findUnique ({
        where: {
            id: moduleId
        },
        include: {
            memberships: true,
        },
    });

    if (!module) {
        throw new Error("Module not found");
    }

    const userMembership = module.memberships.find((membership) => membership.userId === userId);

    if (!userMembership) {
        throw new Error("Not Authorized");
    }

    const targetMembership = module.memberships.find((membership) => membership.userId === memberId);

    if(!targetMembership || targetMembership.memberRole !== "MEMBER") {
        throw new Error("Member not found");
    }

    const isCoach = userMembership.memberRole === "COACH" || userMembership.memberRole === "MODULE_ADMIN";

    const isSelf = userId === memberId;
    
    if(!isCoach && !isSelf) {
        throw new Error("Not authorized");
    }

    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            moduleId,
            memberId,
        },
        orderBy: {
            date: "desc",
        },
    });

    return attendanceRecords;
}