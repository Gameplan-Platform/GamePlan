import { Request, Response } from "express";
import {
    getUserInboxPreviews,
    getMessages,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    getPrivateConversation,
} from "../services/conversation.service";

export async function getUserInboxPreviewsController(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        const moduleId = req.query.moduleId as string | undefined;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const previews = await getUserInboxPreviews(userId, moduleId);

        return res.status(200).json({ previews });
    } catch (error) {
        console.error("Get inbox previews error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getMessagesController(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        const conversationId = req.params.conversationId as string;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await markMessageAsRead(conversationId, userId);
        const messages = await getMessages(conversationId, userId);
        return res.status(200).json({ messages });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";

        if (message === "Not authorized") {
            return res.status(403).json({ error: message });
        }

        console.error("Get messages error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function sendMessageController(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        const conversationId = req.params.conversationId as string;
        const { content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!content || typeof content !== "string") {
            return res.status(400).json({ error: "Message content is required" });
        }

        const message = await sendMessage(conversationId, userId, content);

        return res.status(201).json({ message: "Message sent successfully", data: message, });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";

        if (message === "Not authorized") {
            return res.status(403).json({ error: message });
        }

        console.error("Send message error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getPrivateConversationController(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        const { otherUserId, moduleId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!otherUserId || !moduleId) {
            return res
                .status(400)
                .json({ error: "otherUserId and moduleId are required" });
        }

        const conversation = await getPrivateConversation(
            userId,
            otherUserId,
            moduleId
        );

        return res.status(200).json({ conversation });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        if (message === "Cannot message yourself") {
            return res.status(400).json({ error: message });
        }

        if (message === "Not authorized") {
            return res.status(403).json({ error: message });
        }

        console.error("Get private conversation error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function markConversationAsReadController(req: Request, res: Response) {

    try {

        const userId = req.user?.userId;

        const conversationId = req.params.conversationId as string;

        if (!userId) {

            return res.status(401).json({ error: "Unauthorized" });

        }

        await markConversationAsRead(conversationId, userId);

        return res.status(200).json({ message: "Conversation marked as read" });

    } catch (error) {

        const message = error instanceof Error ? error.message : "Internal server error";

        if (message === "Not authorized") {

            return res.status(403).json({ error: message });

        }

        console.error("Mark conversation as read error:", error);

        return res.status(500).json({ error: "Internal server error" });

    }

}
