import { Server } from "socket.io";

let io: Server;

export function initializeSocket(server: any) {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("conversation.join", (conversationId: string) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
        });

        socket.on("conversation.leave", (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnect: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
}