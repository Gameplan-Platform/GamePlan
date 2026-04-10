import { Router } from "express";
import  { requireAuth } from "../middleware/auth.middleware";
import {
    getUserInboxPreviewsController,
    getMessagesController,
    sendMessageController,
}   from "../controllers/conversation.controller";

const router = Router();

router.get("/", requireAuth, getUserInboxPreviewsController);
router.get("/:conversationId/messages", requireAuth, getMessagesController);
router.post("/:conversationId/message", requireAuth, sendMessageController);

export default router;
