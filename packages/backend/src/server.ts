import app from "./app";
import { config } from "./config/env";
import { connectRedis } from "./lib/redis";

const PORT = config.port || 3000;

async function startServer() {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

startServer();