import prisma from "../lib/prisma";

export async function createGroupConversation( moduleId: string, name: string, memberIds: string[] ) {
    return prisma.conversation.create({
        data: {
            name,
            isGroup: true,
            moduleId,
            members: {
                create: memberIds.map((userId) => ({
                    userId,
                })),
            },
        },
        include: {
            members: true,
            },
        });
}

export async function getUserInboxPreviews( userId: string ) {
     const conversations = await prisma.conversation.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return conversations.map((conversation) => {
        const latestMessage = conversation.messages[0];

        return {
            id: conversation.id,
            name: conversation.name,
            isGroup: conversation.isGroup,
            latestMessage: latestMessage?.content || null, 
            latestMessageTime: latestMessage?.createdAt || null,
            hasUnread:
                latestMessage &&
                latestMessage.senderId !== userId &&
                !latestMessage.isRead,
            members: conversation.members.map((m) => ({
                id: m.user.id,
                firstName: m.user.firstName,
                lasttName: m.user.lastName,
            })),
        };
    });
}

export async function getMessages( conversationId: string, userId: string ) {
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId,
            userId,
        },
    });

    if (!membership) {
        throw new Error("Not authorized");
    }

    return prisma.message.findMany ({
        where: {
            conversationId,
        },
        include: {
            sender: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function sendMessage(
    conversationId: string,
    senderId: string, 
    content: string
) {
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId,
            userId: senderId,
        },
    });

    if (!membership) {
        throw new Error ("Not authorized");
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId,
            content,
        }
    });

    await prisma.conversation.update({
        where: {
            id: conversationId,
        },
        data: {
            updatedAt: new Date(),
        },
    });

    return message;
}

export async function markMessageAsRead(conversationId: string, userId: string) {
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId,
            userId,
        },
    });

    if (!membership) {
        throw new Error ("Not authorized");
    }

    return prisma.message.updateMany({
        where: {
            conversationId,
            senderId: {
                not: userId,
            },
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}

export async function createRoleBasedGroupChats(moduleId: string) {
    const chats = ["Athlete Chat", "Parent Chat", "Coach Chat"];

    return Promise.all(
        chats.map((name) =>
            prisma.conversation.create({
                data: {
                    name,
                    isGroup: true,
                    moduleId,
                },
            })
        )
    );
}

export async function addUserToRoleGroupChat( moduleId: string, userId: string, role: string) {
    let conversationName: string | null = null;

    if (role === "ATHLETE") {
        conversationName = "Athlete Chat";
    } else if (role === "PARENT") {
        conversationName = "Parent Chat";
    } else if (role === "COACH") {
        conversationName = "Coach Chat";
    }

    if (!conversationName) {
        return null;
    }

    const conversation = await prisma.conversation.findFirst({
        where: {
            moduleId,
            isGroup: true,
            name: conversationName,
        },
    });

    if(!conversation) {
        throw new Error ("Group conversation not found");
    }

    return prisma.conversationMember.upsert({
        where: {
            conversationId_userId: {
                conversationId: conversation.id,
                userId,
            },
        },
        update: {},
        create: {
            conversationId: conversation.id,
            userId,
        }
    });
}

export async function findPrivateConversation (userId: string, otherUserId: string, moduleId: string) {
  const conversations = prisma.conversation.findMany({
    where: {
      moduleId,
      isGroup: false,
      members: {
        some: {
          userId: {
            in: [userId, otherUserId],
          },
        },
      },
    },
    include: {
      members: true,
    }
  });

  return (await conversations).find((conversation) =>{
    const memberIds = conversation.members.map((m) => m.userId);

    return (
      memberIds.length === 2 && 
      memberIds.includes(userId) && 
      memberIds.includes(otherUserId)
    );
  }) || null;
}

export async function createPrivateconversation (userId: string, otherUserId: string, moduleId: string){
  return prisma.conversation.create({
    data: {
      moduleId,
      isGroup: false,
      members: {
        create: [ 
          { userId },
          { userId: otherUserId }, 
        ],
      },
    },
    include: {
      members: true,
    }
  });
}

//Will create conversation if it doesn't exist
export async function getPrivateConversation (userId: string, otherUserId: string, moduleId: string) {
  const existingConversation = await findPrivateConversation(userId, otherUserId, moduleId);

  if (existingConversation) {
    return existingConversation;
  }

  return createPrivateconversation(userId, otherUserId, moduleId);
}