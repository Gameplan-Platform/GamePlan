import prisma from "../lib/prisma";

export async function createGroupConversation(moduleId: string, name: string, memberIds: string[]) {
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

export async function getUserInboxPreviews(userId: string, moduleId?: string) {
    const conversations = await prisma.conversation.findMany({
        where: {
            ...(moduleId ? { moduleId } : {}),
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
            members: conversation.members.map((member) => ({
                id: member.user.id,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
            })),
        };
    });
}

export async function getMessages(conversationId: string, userId: string) {
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId,
            userId,
        },
    });

    if (!membership) {
        throw new Error("Not authorized");
    }

    return prisma.message.findMany({
        where: {
            conversationId,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    profilePicture: true,
                },
            },
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
        throw new Error("Not authorized");
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
        throw new Error("Not authorized");
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
    const chats = ["Athlete Chat", "Parent Chat", "Coach Chat", "Module Chat"];

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

export async function addUserToModuleChat(moduleId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            moduleId,
            isGroup: true,
            name: "Module Chat",
        },
    });

    if (!conversation) {
        throw new Error("Module-wide conversation not found");
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
        },
    });
}

export async function markConversationAsRead(conversationId: string, userId: string) {
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId,
            userId,
        },
    });

    if (!membership) {
        throw new Error("Not authorized");
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

export async function addUserToRoleGroupChat(moduleId: string, userId: string, role: string) {
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

    if (!conversation) {
        throw new Error("Group conversation not found");
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

export async function findPrivateConversation(userId: string, otherUserId: string, moduleId: string) {
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

    return (await conversations).find((conversation) => {
        const memberIds = conversation.members.map((m) => m.userId);

        return (
            memberIds.length === 2 &&
            memberIds.includes(userId) &&
            memberIds.includes(otherUserId)
        );
    }) || null;
}

export async function createPrivateConversation(userId: string, otherUserId: string, moduleId: string) {
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
export async function getPrivateConversation(userId: string, otherUserId: string, moduleId: string) {
    if (userId === otherUserId) {
        throw new Error("Cannot message yourself");
    }

    const memberships = await prisma.moduleMembership.findMany({
        where: {
            moduleId,
            userId: {
                in: [userId, otherUserId],
            },
        },
    });

    if (memberships.length !== 2) {
        throw new Error("Not authorized");
    }

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: [userId, otherUserId],
            },
        },
        select: {
            id: true,
            role: true,
        },
    });

    const currentUser = users.find((user) => user.id === userId);
    const otherUser = users.find((user) => user.id === otherUserId);

    if (!currentUser || !otherUser) {
        throw new Error("Not authorized");
    }

    const canMessage = canInitiatePrivateConversation(
        currentUser.role,
        otherUser.role
    );

    if (!canMessage) {
        throw new Error("Not authorized");
    }

    const existingConversation = await findPrivateConversation(
        userId,
        otherUserId,
        moduleId
    );

    if (existingConversation) {
        return existingConversation;
    }

    return createPrivateConversation(userId, otherUserId, moduleId);
}

function canInitiatePrivateConversation(senderRole: string, targetRole: string) {
    if (senderRole === "COACH") {
        return ["COACH", "ATHLETE", "PARENT"].includes(targetRole);
    }

    if (senderRole === "ATHLETE") {
        return ["COACH", "ATHLETE"].includes(targetRole);
    }

    if (senderRole === "PARENT") {
        return ["PARENT", "ATHLETE"].includes(targetRole);
    }

    return false;
}