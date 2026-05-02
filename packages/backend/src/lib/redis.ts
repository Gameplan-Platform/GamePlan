import { createClient } from "redis";
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("Missing REDIS_URL");
}

export const publisher = createClient({
    url: redisUrl,
});

export const subscriber = publisher.duplicate();

publisher.on("error", (err) => {
    console.error("Redis Publisher Error:", err)
});

subscriber.on("error", (err) => {
    console.error("Redis Subscriber Error:", err);
});

export async function connectRedis() {
    if (!publisher.isOpen) {
        await publisher.connect();
    }

    if (!subscriber.isOpen) {
        await subscriber.connect();
    }

    console.log("Redis connected");
}