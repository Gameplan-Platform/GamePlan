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
      name: "Team",
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
      create: { userId: user.id, moduleId: customModule.id, memberRole: "MODULE_ADMIN" },
    });
  }

  // Seed some demo events on the gym module
  const now = new Date();
  const eventData = [
    {
      title: "Blackout Practice",
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      startTime: "10:00 am",
      endTime: "1:00 pm",
      description: "Full team blackout practice. Wear all black.",
    },
    {
      title: "Nfinity Practice",
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      startTime: "2:00 pm",
      endTime: "3:00 pm",
      description: "Nfinity routine run-through.",
    },
    {
      title: "Team Meeting",
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      startTime: "9:00 am",
      endTime: "10:00 am",
      allDay: false,
      description: "Monthly team sync to discuss progress and upcoming competitions.",
    },
    {
      title: "Competition Day",
      date: new Date(now.getFullYear(), now.getMonth(), 20),
      allDay: true,
      description: "Spirit Sports regional competition. Be there early!",
    },
  ];

  for (const ev of eventData) {
    await prisma.event.create({
      data: {
        ...ev,
        moduleId: gymModule.id,
        createdById: coach.id,
      },
    });
  }

  console.log("Seed complete!");
  console.log("Demo accounts (password: devpassword):");
  console.log("  Coach:   coach@gameplan.dev / coach");
  console.log("  Athlete: athlete@gameplan.dev / athlete");
  console.log("  Parent:  parent@gameplan.dev / parent");
  console.log("Modules: Gym, Staff, Team Alpha");
  console.log("Events: 4 demo events seeded on Gym module");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
