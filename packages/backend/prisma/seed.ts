/// <reference types="node" />
import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/password.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");
  const hashed = await hashPassword("devpassword");

  await prisma.user.upsert({
    where: { email: "admin@gameplan.dev" },
    update: {},
    create: {
      email: "admin@gameplan.dev",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      dob: new Date("2001-01-01"),
      password: hashed,
      role: Role.COACH,
    },
  });
  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });