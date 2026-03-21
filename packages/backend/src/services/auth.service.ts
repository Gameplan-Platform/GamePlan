import prisma from "../lib/prisma";
import { ModuleMemberRole, Role } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { generateVerificationToken } from "../utils/token";
import { sendVerificationEmail } from "./email.service";
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
  const verificationToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: {
      email,
      username,
      firstName,
      lastName,
      dob: new Date(dob),
      password: hashedPassword,
      verificationToken,
      emailVerified: false,
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

  await sendVerificationEmail(email, verificationToken);

  await enrollUserInDefaultModules(user.id, user.role);

  return user;
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new Error("Invalid verification token");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  const accessToken = generateAccessToken({ userId: updated.id, role: updated.role });
  return { message: "Email verified successfully", token: accessToken };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  const verificationToken = generateVerificationToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  await sendVerificationEmail(email, verificationToken);

  return { message: "Verification email sent" };
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
