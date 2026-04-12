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