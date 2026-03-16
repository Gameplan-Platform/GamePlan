import prisma from "../lib/prisma";
import { ModuleMemberRole, Role } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { SignupInput, LoginInput } from "../validators/auth.validator";

async function enrollUserInDefaultModules(userId: string, role: Role) {
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

export async function signupUser(data: SignupInput) {
  const { email, username, firstName, lastName, dob, password } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new Error("Email or username already in use");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      firstName,
      lastName,
      dob: new Date(dob),
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      dob: true,
      role: true,
      createdAt: true,
    },
  });

  await enrollUserInDefaultModules(user.id, user.role);

  return user;
}

export async function loginUser(data: LoginInput) {
  const { identifier, password } = data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
      ],
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordValid = await comparePassword(password, user.password);

  if (!passwordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return { token };
}