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

  if (membership.memberRole !== "MODULE_ADMIN") {
    throw new Error("Only module admins can create agenda items");
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

export async function getAgenda(userId: string, moduleId: string, agendaId: string) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (!membership) throw new Error("Not a member of this module");

  const agenda = await prisma.agenda.findFirst({
    where: { id: agendaId, moduleId },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });
  if (!agenda) throw new Error("Agenda not found");

  const { _count, likes, ...rest } = agenda;
  return { ...rest, likeCount: _count.likes, likedByMe: likes.length > 0, memberRole: membership.memberRole };
}

export async function listAgendas(userId: string, moduleId: string) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) {
    throw new Error("Not a member of this module");
  }

  const agendas = await prisma.agenda.findMany({
    where: { moduleId },
    orderBy: { date: "asc" },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
      _count: { select: { likes: true } },
      likes: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  return agendas.map(({ _count, likes, ...a }) => ({
    ...a,
    likeCount: _count.likes,
    likedByMe: likes.length > 0,
  }));
}

export async function likeAgenda(
  userId: string,
  moduleId: string,
  agendaId: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (!membership) throw new Error("Not a member of this module");

  const agenda = await prisma.agenda.findFirst({
    where: { id: agendaId, moduleId },
  });
  if (!agenda) throw new Error("Agenda not found");

  await prisma.agendaLike.upsert({
    where: { userId_agendaId: { userId, agendaId } },
    create: { userId, agendaId },
    update: {},
  });
}

export async function unlikeAgenda(
  userId: string,
  moduleId: string,
  agendaId: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (!membership) throw new Error("Not a member of this module");

  await prisma.agendaLike.deleteMany({
    where: { userId, agendaId },
  });
}

export async function deleteAgenda(
  userId: string,
  moduleId: string,
  agendaId: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) throw new Error("Not a member of this module");
  if (membership.memberRole !== "MODULE_ADMIN") throw new Error("Only module admins can delete agenda items");

  const agenda = await prisma.agenda.findFirst({
    where: { id: agendaId, moduleId },
  });
  if (!agenda) throw new Error("Agenda not found");

  await prisma.agenda.delete({ where: { id: agendaId } });
}
