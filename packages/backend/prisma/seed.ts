import "dotenv/config";
import prisma from "../src/lib/prisma.ts";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("devpassword", 10);

  // Create system modules
  const gymModule = await prisma.module.upsert({
    where: { systemKey: "gym" },
    update: {},
    create: {
      name: "Gym",
      description: "Default gym-wide module",
      joinCode: "GYM001",
      type: "SYSTEM",
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
      type: "SYSTEM",
      systemKey: "staff",
    },
  });

  // Create a custom module for demo
  const customModule = await prisma.module.upsert({
    where: { joinCode: "TEAM01" },
    update: {},
    create: {
      name: "Team Alpha",
      description: null,
      joinCode: "TEAM01",
      type: "CUSTOM",
    },
  });

  // Create pre-verified coach
  const coach = await prisma.user.upsert({
    where: { email: "coach@gameplan.dev" },
    update: {},
    create: {
      email: "coach@gameplan.dev",
      username: "coach",
      firstName: "Demo",
      lastName: "Coach",
      dob: new Date("1990-01-01"),
      password: hashedPassword,
      role: "COACH",
      emailVerified: true,
      verificationToken: null,
    },
  });

  // Create pre-verified athlete
  const athlete = await prisma.user.upsert({
    where: { email: "athlete@gameplan.dev" },
    update: {},
    create: {
      email: "athlete@gameplan.dev",
      username: "athlete",
      firstName: "Demo",
      lastName: "Athlete",
      dob: new Date("2005-01-01"),
      password: hashedPassword,
      role: "ATHLETE",
      emailVerified: true,
      verificationToken: null,
    },
  });

  // Create pre-verified parent
  const parent = await prisma.user.upsert({
    where: { email: "parent@gameplan.dev" },
    update: {},
    create: {
      email: "parent@gameplan.dev",
      username: "parent",
      firstName: "Demo",
      lastName: "Parent",
      dob: new Date("1985-01-01"),
      password: hashedPassword,
      role: "PARENT",
      emailVerified: true,
      verificationToken: null,
    },
  });

  // Enroll everyone in gym module
  for (const user of [coach, athlete, parent]) {
    await prisma.moduleMembership.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: gymModule.id } },
      update: {},
      create: { userId: user.id, moduleId: gymModule.id, memberRole: "MEMBER" },
    });
  }

  // Enroll coach in staff module
  await prisma.moduleMembership.upsert({
    where: { userId_moduleId: { userId: coach.id, moduleId: staffModule.id } },
    update: {},
    create: { userId: coach.id, moduleId: staffModule.id, memberRole: "MEMBER" },
  });

  // Enroll coach and athlete in custom module
  for (const user of [coach, athlete]) {
    await prisma.moduleMembership.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: customModule.id } },
      update: {},
      create: { userId: user.id, moduleId: customModule.id, memberRole: user.id === coach.id ? "MODULE_ADMIN" : "MEMBER" },
    });
  }

  console.log("Seed complete!");
  console.log("Demo accounts (password: devpassword):");
  console.log("  Coach:   coach@gameplan.dev / coach");
  console.log("  Athlete: athlete@gameplan.dev / athlete");
  console.log("  Parent:  parent@gameplan.dev / parent");
  console.log("Modules: Gym, Staff, Team Alpha");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
