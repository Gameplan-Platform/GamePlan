import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string) {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}