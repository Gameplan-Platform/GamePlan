import prisma from "../lib/prisma";
import { generateJoinCode } from "../utils/generateJoinCode";

async function generateUniqueJoinCode(): Promise<string> {
  let joinCode = generateJoinCode();

  while (await prisma.module.findUnique({ where: { joinCode } })) {
    joinCode = generateJoinCode();
  }

  return joinCode;
}

export async function createModule(userId: string, name: string, description?: string) {
  const joinCode = await generateUniqueJoinCode();

  const module = await prisma.module.create({
    data: {
      name,
      description,
      joinCode,
      type: "CUSTOM",
      createdById: userId,
      memberships: {
        create: {
          userId,
          memberRole: "MODULE_ADMIN",
        },
      },
    },
    include: {
      memberships: true,
    },
  });

  return module;
}

export async function listMyModules(userId: string) {
  return prisma.module.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

//add module
export async function joinModule(userId: string, joinCode: string, userRole: string)
{
  // find module by join code
  const module = await prisma.module.findUnique({
    where: { joinCode },
  });

  if (!module){
    throw new Error("Invalid join code");
  }
  //check if already a member
  const existingMem = await prisma.moduleMembership.findUnique({
    where: {
      userId_moduleId: { userId, moduleId: module.id},
    },
  });

  if (existingMem){
    throw new Error("Already a member");
  }

  //coaches get admin access??
  const memberRole = userRole === "COACH" ? "MODULE_ADMIN" : "MEMBER";

  const membership = await prisma.moduleMembership.create({
    data: {
      userId,
      moduleId: module.id,
      memberRole,
    },
  });

  return { module, membership };
}