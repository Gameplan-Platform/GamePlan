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

  // Enroll coach as admin and athlete as member in custom module
  await prisma.moduleMembership.upsert({
    where: { userId_moduleId: { userId: coach.id, moduleId: customModule.id } },
    update: {},
    create: { userId: coach.id, moduleId: customModule.id, memberRole: "MODULE_ADMIN" },
  });

  await prisma.moduleMembership.upsert({
    where: { userId_moduleId: { userId: athlete.id, moduleId: customModule.id } },
    update: {},
    create: { userId: athlete.id, moduleId: customModule.id, memberRole: "MEMBER" },
  });

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

  await prisma.event.deleteMany({ where: { moduleId: gymModule.id } });
  for (const ev of eventData) {
    await prisma.event.create({
      data: {
        ...ev,
        moduleId: gymModule.id,
        createdById: coach.id,
      },
    });
  }

  // Seed October 2025 full outs on custom module for stats demo
  const oct2025FullOuts = [
    {
      title: "Full Out 1",
      date: new Date("2025-10-02"),
      deductions: [
        { category: "AF",    value: 2 },
        { category: "BB",    value: 1 },
        { category: "OOB",   value: 3 },
      ],
    },
    {
      title: "Full Out 2",
      date: new Date("2025-10-05"),
      deductions: [
        { category: "AF",    value: 3 },
        { category: "BF",    value: 1 },
        { category: "OOL-T", value: 2 },
        { category: "TLV",   value: 1 },
      ],
    },
    {
      title: "Full Out 3",
      date: new Date("2025-10-08"),
      deductions: [
        { category: "MAF",   value: 2 },
        { category: "BB",    value: 3 },
        { category: "OOB",   value: 2 },
        { category: "APS",   value: 1 },
      ],
    },
    {
      title: "Full Out 4",
      date: new Date("2025-10-11"),
      deductions: [
        { category: "AF",    value: 4 },
        { category: "MBF",   value: 1 },
        { category: "OOL-B", value: 2 },
        { category: "SRD",   value: 1 },
      ],
    },
    {
      title: "Full Out 5",
      date: new Date("2025-10-14"),
      deductions: [
        { category: "AF",    value: 1 },
        { category: "BB",    value: 2 },
        { category: "BF",    value: 1 },
        { category: "UNI",   value: 3 },
      ],
    },
    {
      title: "Full Out 6",
      date: new Date("2025-10-17"),
      deductions: [
        { category: "AF",    value: 5 },
        { category: "MAF",   value: 1 },
        { category: "OOB",   value: 4 },
        { category: "TLV",   value: 2 },
      ],
    },
    {
      title: "Full Out 7",
      date: new Date("2025-10-20"),
      deductions: [
        { category: "BB",    value: 4 },
        { category: "BF",    value: 2 },
        { category: "OOL-T", value: 3 },
        { category: "APS",   value: 2 },
      ],
    },
    {
      title: "Full Out 8",
      date: new Date("2025-10-23"),
      deductions: [
        { category: "AF",    value: 2 },
        { category: "MBF",   value: 2 },
        { category: "OOL-B", value: 1 },
        { category: "OOB",   value: 3 },
      ],
    },
    {
      title: "Full Out 9",
      date: new Date("2025-10-26"),
      deductions: [
        { category: "AF",    value: 3 },
        { category: "BB",    value: 1 },
        { category: "SRD",   value: 2 },
        { category: "TLV",   value: 1 },
      ],
    },
    {
      title: "Full Out 10",
      date: new Date("2025-10-29"),
      deductions: [
        { category: "AF",    value: 1 },
        { category: "BF",    value: 1 },
        { category: "OOB",   value: 2 },
        { category: "MAF",   value: 3 },
        { category: "APS",   value: 1 },
      ],
    },
  ]

  await prisma.routine.deleteMany({ where: { moduleId: customModule.id } });
  for (const fo of oct2025FullOuts) {
    await prisma.routine.create({
      data: {
        title: fo.title,
        date: fo.date,
        isFullOut: true,
        moduleId: customModule.id,
        athleteId: coach.id,
        createdById: coach.id,
        deductions: { create: fo.deductions },
      },
    })
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
