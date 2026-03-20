import { Request, Response } from "express";
import { validateSignup, validateLogin } from "../validators/auth.validator";
import { signupUser, loginUser, verifyEmail, resendVerification } from "../services/auth.service";
import { generateAccessToken } from "../utils/jwt";
import prisma from "../lib/prisma";

export async function login(req: Request, res: Response) {
  let identifier: string, password: string;

  try {
    ({ identifier, password } = validateLogin(req.body));
  } catch (err) {
    res.status(400).json({
      error: (err as Error).message,
    });
    return;
  }

  try {
    const { token } = await loginUser({ identifier, password });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "Invalid credentials") {
      return res.status(401).json({
        error: message,
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function signup(req: Request, res: Response): Promise<void> {
  let email: string,
    username: string,
    firstName: string,
    lastName: string,
    dob: string,
    password: string;

  try {
    ({ email, username, firstName, lastName, dob, password } =
      validateSignup(req.body));
  } catch (err) {
    res.status(400).json({
      error: (err as Error).message,
    });
    return;
  }

  try {
    const user = await signupUser({
      email,
      username,
      firstName,
      lastName,
      dob,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "Email or username already in use") {
      res.status(409).json({
        error: message,
      });
      return;
    }

    console.error("Signup error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function verify(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const { message, token: accessToken } = await verifyEmail(token);
    return res.status(200).json({ message, token: accessToken });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "Invalid verification token") {
      return res.status(400).json({ error: message });
    }
    if (message === "Email already verified") {
      return res.status(400).json({ error: message });
    }

    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function resend(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await resendVerification(email.trim());
    return res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;

    if (message === "User not found") {
      return res.status(404).json({ error: message });
    }
    if (message === "Email already verified") {
      return res.status(400).json({ error: message });
    }

    console.error("Resend verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function bypassVerify(req: Request, res: Response) {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: email.trim() } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    const token = generateAccessToken({ userId: user.id, role: user.role });
    return res.status(200).json({ message: "Verification bypassed", token });
  } catch (error) {
    console.error("Bypass verify error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, username: true, emailVerified: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
