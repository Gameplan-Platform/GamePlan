import { subscriber } from "../lib/redis";
import { getIO } from "../lib/socket";

type PubSubEvent = {
    type: string;
    conversationId: string;
    payload: unknown;
};

export async function subscribeToMessagingEvents() {
    await subscriber.subscribe("messaging", (message) => {
        try {
            const event = JSON.parse(message) as PubSubEvent;
            const io = getIO();
            io.to(`conversation:${event.conversationId}`).emit(event.type, event.payload);
        } catch (error) {
            console.error("failed to handle messaging pub/sub event:", error);
        }
    });

    console.log("Subscribed to messaging pub/sub events");
}