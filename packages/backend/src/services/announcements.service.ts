import prisma from "../lib/prisma";

export async function createAnnouncement(
  authorId: string,
  moduleId: string,
  title: string,
  body: string
) {
  // Verify the author is a member of this module
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId: authorId, moduleId } },
  });

  if (!membership) {
    throw new Error("Not a member of this module");
  }

  return prisma.announcement.create({
    data: { title, body, moduleId, authorId },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function listAnnouncements(userId: string, moduleId: string) {
  // Verify user is a member of this module
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!membership) {
    throw new Error("Not a member of this module");
  }

  return prisma.announcement.findMany({
    where: { moduleId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}
