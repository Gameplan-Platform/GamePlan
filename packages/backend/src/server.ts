import app from "./app";
import http from "http";
import { config } from "./config/env";
import { connectRedis } from "./lib/redis";
import { initializeSocket } from "./lib/socket";


const PORT = config.port || 3000;

async function startServer() {
  try {
    await connectRedis();
    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

startServer();