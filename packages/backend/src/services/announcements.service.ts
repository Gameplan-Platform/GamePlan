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

  const announcements = await prisma.announcement.findMany({
    where: { moduleId },
    orderBy: { createdAt: "desc" },
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

  return announcements.map(({ _count, likes, ...a }) => ({
    ...a,
    likeCount: _count.likes,
    likedByMe: likes.length > 0,
  }));
}

export async function likeAnnouncement(
  userId: string,
  moduleId: string,
  announcementId: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (!membership) throw new Error("Not a member of this module");

  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, moduleId },
  });
  if (!announcement) throw new Error("Announcement not found");

  await prisma.announcementLike.upsert({
    where: { userId_announcementId: { userId, announcementId } },
    create: { userId, announcementId },
    update: {},
  });
}

export async function unlikeAnnouncement(
  userId: string,
  moduleId: string,
  announcementId: string
) {
  const membership = await prisma.moduleMembership.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (!membership) throw new Error("Not a member of this module");

  await prisma.announcementLike.deleteMany({
    where: { userId, announcementId },
  });
}
