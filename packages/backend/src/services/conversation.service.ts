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
    return prisma.conversation.findMany({
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
}

export async function getConversationMessages( conversationId: string, userId: string ) {
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