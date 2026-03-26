import prisma from "../lib/prisma";

export async function createAgenda(
  authorId: string,
  moduleId: string,
  title: string,
  description: string | undefined,
  date: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId: authorId, moduleId } },
  });

  if (!membership) {
    throw new Error("Not a member of this module");
  }

  return prisma.agenda.create({
    data: { title, description, date: new Date(date), moduleId, authorId },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function listAgendas(userId: string, moduleId: string) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) {
    throw new Error("Not a member of this module");
  }

  return prisma.agenda.findMany({
    where: { moduleId },
    orderBy: { date: "asc" },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}
