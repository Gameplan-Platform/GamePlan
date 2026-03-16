import "dotenv/config";
import prisma from "../src/lib/prisma.ts";
import { ModuleMemberRole, ModuleType, Role } from "@prisma/client";
import bcrypt from "bcrypt";

async function ensureSystemModules() {
  const gymModule = await prisma.module.upsert({
    where: { systemKey: "gym" },
    update: {},
    create: {
      name: "Gym",
      description: "Default gym-wide module",
      joinCode: "GYM001",
      type: ModuleType.SYSTEM,
      systemKey: "gym",
    },
  });

  const staffModule = await prisma.module.upsert({
    where: { systemKey: "staff" },
    update: {},
    create: {
      name: "Staff",
      description: "Staff-only module",
      joinCode: "STAFF1",
      type: ModuleType.SYSTEM,
      systemKey: "staff",
    },
  });

  return { gymModule, staffModule };
}

async function enrollUserInSystemModules(userId: string, role: Role) {
  const gymModule = await prisma.module.findUnique({
    where: { systemKey: "gym" },
  });

  const staffModule = await prisma.module.findUnique({
    where: { systemKey: "staff" },
  });

  if (gymModule) {
    await prisma.moduleMembership.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId: gymModule.id,
        },
      },
      update: {},
      create: {
        userId,
        moduleId: gymModule.id,
        memberRole: ModuleMemberRole.MEMBER,
      },
    });
  }

  if (staffModule && role === Role.COACH) {
    await prisma.moduleMembership.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId: staffModule.id,
        },
      },
      update: {},
      create: {
        userId,
        moduleId: staffModule.id,
        memberRole: ModuleMemberRole.MEMBER,
      },
    });
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash("devpassword", 10);

  const { gymModule, staffModule } = await ensureSystemModules();

  const coach = await prisma.user.upsert({
    where: { email: "admin@gameplan.dev" },
    update: {},
    create: {
      email: "admin@gameplan.dev",
      username: "admin",
      firstName: "Admin",
      lastName: "Coach",
      dob: new Date("2000-01-01"),
      password: hashedPassword,
      role: Role.COACH,
    },
  });

  const athlete = await prisma.user.upsert({
    where: { email: "athlete@gameplan.dev" },
    update: {},
    create: {
      email: "athlete@gameplan.dev",
      username: "athlete1",
      firstName: "Test",
      lastName: "Athlete",
      dob: new Date("2005-01-01"),
      password: hashedPassword,
      role: Role.ATHLETE,
    },
  });

  await enrollUserInSystemModules(coach.id, coach.role);
  await enrollUserInSystemModules(athlete.id, athlete.role);

  console.log("Seed complete");
  console.log("Gym module:", gymModule.name);
  console.log("Staff module:", staffModule.name);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });