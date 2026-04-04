import { Request, Response } from "express";
import { createEvent, listEvents, getEvent, deleteEvent, editEvent } from "../services/events.service";

export async function createEventController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId, title, date, startTime, endTime, allDay, description } = req.body;

    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const event = await createEvent(
      req.user.userId,
      moduleId,
      title,
      parsedDate,
      startTime,
      endTime,
      allDay,
      description
    );

    return res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module" || message === "Not authorized") {
      return res.status(403).json({ error: message });
    }

    console.error("Create event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listEventsController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { moduleId } = req.params;

    if (!moduleId) return res.status(400).json({ error: "Module ID is required" });

    const events = await listEvents(req.user.userId, moduleId as string);

    return res.status(200).json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Not a member of this module") {
      return res.status(403).json({ error: message });
    }

    console.error("List events error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getEventController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const event = await getEvent(req.user.userId, req.params.id as string);

    return res.status(200).json(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Event not found") return res.status(404).json({ error: message });
    if (message === "Not authorized") return res.status(403).json({ error: message });

    console.error("Get event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteEventController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await deleteEvent(req.user.userId, req.params.id as string);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "Event not found") return res.status(404).json({ error: message });
    if (message === "Not authorized") return res.status(403).json({ error: message });

    console.error("Delete event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editEventController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const event = await editEvent(req.user.userId, req.params.id as string, req.body);
    return res.status(200).json({ message: " Event updated successfully", event });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Interal server error";
    if (message === "Event not found") return res.status(404).json({ error: message });
    if (message == "Not authorized") return res.status(403).json({ error: message });
    return res.status(500).json({ error: "Internal server error" });

  }
}