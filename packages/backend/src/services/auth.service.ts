import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { SignupInput, LoginInput } from "../validators/auth.validator";

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