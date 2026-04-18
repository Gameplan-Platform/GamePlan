import prisma from "../lib/prisma";
import { generateJoinCode } from "../utils/generateJoinCode";
import { createRoleBasedGroupChats, addUserToRoleGroupChat } from "./conversation.service";

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

  await createRoleBasedGroupChats(module.id);

  const creator = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!creator) {
    throw new Error("User not found");
  }

  await addUserToRoleGroupChat(module.id, userId, creator.role);
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
export async function joinModule(userId: string, joinCode: string) {
  const module = await prisma.module.findUnique({
    where: {
      joinCode
    },
  });

  if (!module) {
    throw new Error("Invalid join code");
  }

  const existingMem = await prisma.moduleMembership.findUnique({
    where: {
      userId_moduleId: { userId, moduleId: module.id },
    },
  });

  if (existingMem) {
    throw new Error("Already a member");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      role: true
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const memberRole = "MEMBER";

  const membership = await prisma.moduleMembership.create({
    data: {
      userId,
      moduleId: module.id,
      memberRole,
    },
  });

  await addUserToRoleGroupChat(module.id, userId, user.role);

  return { module, membership };
}

export async function getModuleInfo(moduleId: string, userId: string) {
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
    (member: { userId: string }) => member.userId === userId);

  if (!membership) {
    throw new Error("Not authorized");
  }

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

export async function getModuleNavigation(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      memberships: true,
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const isMember = module.memberships.some(
    (member: { userId: string }) => member.userId === userId
  );

  if (!isMember) {
    throw new Error("Not authorized");
  }

  let tabs: string[] = [];

  if (module.systemKey === "staff") {
    tabs = ["dashboard", "calendar", "roster", "messaging"];
  } else if (module.systemKey === "gym") {
    tabs = ["dashboard", "calendar"];
  } else {
    tabs = ["home", "calendar", "progress", "roster", "messaging"];
  }

  return {
    moduleId: module.id,
    moduleName: module.name,
    moduleType: module.type,
    systemKey: module.systemKey,
    tabs,
  };
}

export async function getModuleRoster(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const isMember = module.memberships.some(
    (member: { userId: string }) => member.userId === userId
  );

  if (!isMember) {
    throw new Error("Not authorized");
  }

  return module.memberships.map((membership) => ({
    userId: membership.user.id,
    name: `${membership.user.firstName} ${membership.user.lastName}`,
    role: membership.memberRole,
    email: membership.user.email,
    profilePicture: membership.user.profilePicture,
  }));
}

