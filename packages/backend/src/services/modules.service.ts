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

export async function updateModule(moduleId: string, userId: string, name: string, description?: string) {
  const module = await prisma.module.findUnique({ where: { id: moduleId } });

  if (!module) throw new Error('Module not found');
  if (module.createdById !== userId) throw new Error('Not authorized');

  return prisma.module.update({
    where: { id: moduleId },
    data: { name, description },
  });
}

export async function deleteModule(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({ where: { id: moduleId } });

  if (!module) throw new Error('Module not found');
  if (module.createdById !== userId) throw new Error('Not authorized');

  await prisma.module.delete({ where: { id: moduleId } });
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

export async function getModuleInfo(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      memberships: true,
    }
  });

  if(!module)
    throw new Error("Module not found");
  
  const membership = module.memberships.find(
    (member: { userId: string }) => member.userId === userId);

  if(!membership)
    throw new Error("Not authorized");

  return {
    id: module.id,
    name: module.name,
    description: module.description,
    type: module.type,
    systemKey: module.systemKey,
    joinCode: module.joinCode,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
    memberRole: membership.memberRole,
  };
}