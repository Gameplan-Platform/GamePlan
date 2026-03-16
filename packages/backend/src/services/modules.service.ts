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