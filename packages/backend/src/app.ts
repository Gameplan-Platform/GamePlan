import express from "express";
import healthRoutes from "./routes/health.routes";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import teamsRoutes from "./routes/teams.routes";
import modulesRoutes from "./routes/modules.routes";
import attendanceRoutes from "./routes/attendance.routes";
import eventsRoutes from "./routes/events.routes";
import announcementsRoutes from "./routes/announcements.routes";
import agendasRoutes from "./routes/agenda.routes";
import conversationRoutes from "./routes/conversation.routes";
import { goalsModuleRouter, goalsByIdRouter } from "./routes/goals.routes";
import { routinesModuleRouter, routinesByIdRouter } from "./routes/routines.routes";
import scoresRoutes from "./routes/scores.routes";

/* Express App */
const app = express();

app.use(express.json());

/* Mount Api Routes */
app.use("/api", healthRoutes);
app.use("/auth", authRoutes);
app.use("/teams", teamsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/modules", attendanceRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/modules/:moduleId/announcements", announcementsRoutes);
app.use("/api/modules/:moduleId/agendas", agendasRoutes);
app.use("/api/modules/:moduleId/goals", goalsModuleRouter);
app.use("/api/modules/:moduleId/routines", routinesModuleRouter);
app.use("/api/goals", goalsByIdRouter);
app.use("/api/routines", routinesByIdRouter);
app.use("/api/conversations", conversationRoutes);
app.use("/api/modules/:moduleId/scores", scoresRoutes);

export default app;
