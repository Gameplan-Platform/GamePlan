import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
    getUserInboxPreviewsController,
    getMessagesController,
    sendMessageController,
    getPrivateConversationController,
    markConversationAsReadController,
} from "../controllers/conversation.controller";

const router = Router();

router.get("/", requireAuth, getUserInboxPreviewsController);
router.get("/:conversationId/messages", requireAuth, getMessagesController);
router.post("/:conversationId/message", requireAuth, sendMessageController);
router.post("/private", requireAuth, getPrivateConversationController);
router.patch("/:conversationId/read", requireAuth, markConversationAsReadController);
export default router;
