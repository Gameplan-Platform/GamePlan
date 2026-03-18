import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { generateAccessToken } from "../utils/jwt";

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

      if (parsed.data.role === 'COACH') {
        const staffModule = await prisma.module.findUnique({ where: { systemKey: 'staff' } });
        if (staffModule) {
          await prisma.moduleMembership.upsert({
            where: { userId_moduleId: { userId: req.user!.userId, moduleId: staffModule.id } },
            update: {},
            create: { userId: req.user!.userId, moduleId: staffModule.id, memberRole: 'MEMBER' },
          });
        }
      }

      const token = generateAccessToken({ userId: req.user!.userId, role: parsed.data.role });
      return res.json({ success: true, data: updated, token });
    } catch (error) {
      console.error("Role update error:", error);
      return res.status(500).json({ error: "Internal server error."});
    }
}