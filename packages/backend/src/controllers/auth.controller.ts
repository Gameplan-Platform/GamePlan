import { Request, Response } from "express";
import { validateSignup, validateLogin } from "../validators/auth.validator";
import { signupUser, loginUser } from "../services/auth.service";

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