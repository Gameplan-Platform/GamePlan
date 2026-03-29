import { Request, Response } from "express";
import { getModuleAttendanceForDate, saveModuleAttendanceForDate } from "../services/attendance.service";

export async function getModuleAttendance(req: Request, res: Response) {
  try {
    const moduleId = req.params.moduleId as string;
    const date = req.query.date as string;
    const userId = (req as any).user?.userId ?? (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const result = await getModuleAttendanceForDate(moduleId, userId, date);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "Not authorized") {
        return res.status(403).json({ message: error.message });
      }
    }

    return res.status(500).json({ message: "Failed to fetch attendance" });
  }
}

export async function saveModuleAttendance(req: Request, res: Response) {
    try {
        const moduleId = req.params.moduleId as string;
        const { date, records} = req.body;
        const userId = (req as any).user?.userId ?? (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ message: "Records must be an array" });
        }

        const result = await saveModuleAttendanceForDate(moduleId, userId, String(date), records);

        return res.status(200).json({ message: "Attendance saved successfully",
            date: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Module not found") {
                return res.status(404).json({ message: error.message })
            }

            if (error.message === "Not authorized") {
                return res.status(403).json({ message: error.message});
            }
            
            if (error.message === "Incalid date" || error.message === "Invalid module member"
                || error.message === "Duplicate memberId in request"
            ) {
                return res.status(400).json({ message: error.message});

            } 
        }
        return res.status(500).json({ message: "Failed to save attendance" });
    }
}