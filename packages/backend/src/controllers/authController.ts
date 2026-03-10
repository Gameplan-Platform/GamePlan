import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../utils/password"

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function signup(req: Request, res: Response): Promise<void> {
    try{
        const { email, username, firstName, lastName, dob, password } = req.body;

        if (!email || !username || !firstName || !lastName || !dob || !password ) {
            res.status(400).json({
                error:
                "email, username, firstName, lastName, dob, & password are required",
            });
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        
        if (existingUser) {
            res.status(400).json({
                error: "Email or username already in use",
            });
            return;
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
                role: Role.COACH,
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

        res.status(201).json({
            message:"User created successfully",
            user,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(400).json({
            error: "Internal server error",
        });
    }
}