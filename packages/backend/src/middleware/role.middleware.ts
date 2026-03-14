import { Request, Response, NextFunction } from "express";

export function requireRole(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.role) {
    res.status(403).json({ error: "Role not selected." });
    return;
  }
  next();
}
