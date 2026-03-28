import prisma from "../lib/prisma";

export async function createEvent(
  userId: string,
  moduleId: string,
  title: string,
  date: Date,
  startTime?: string,
  endTime?: string,
  allDay?: boolean,
  description?: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) throw new Error("Not a member of this module");
  if (membership.memberRole !== "MODULE_ADMIN") throw new Error("Not authorized");

  return prisma.event.create({
    data: {
      title,
      date,
      startTime,
      endTime,
      allDay: allDay ?? false,
      description,
      moduleId,
      createdById: userId,
    },
  });
}

export async function listEvents(userId: string, moduleId: string) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) throw new Error("Not a member of this module");

  return prisma.event.findMany({
    where: { moduleId },
    orderBy: { date: "asc" },
  });
}

export async function getEvent(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) throw new Error("Event not found");

  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId: event.moduleId } },
  });

  if (!membership) throw new Error("Not authorized");

  return event;
}

export async function deleteEvent(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) throw new Error("Event not found");
  if (event.createdById !== userId) throw new Error("Not authorized");

  await prisma.event.delete({ where: { id: eventId } });
}
