import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma"

const RoleSchema = z.object({
    role: z.enum(["ATHLETE", "PARENT", "COACH"]),
  });

export async function selectRole(req: Request, res: Response){
    const parsed = RoleSchema.safeParse(req.body);

    if (!parsed.success){
        return res.status(400).json({ error: "Invalid role."});
    }

    try {
      const updated = await prisma.user.update({
        where: { id: req.user!.userId },
        data: { role: parsed.data.role },
      });

      return res.json({ sucess: true, data: updated });
    } catch (error) {
      console.error("Role update error:", error);
      return res.status(500).json({ error: "Internal server error."});
    }
}