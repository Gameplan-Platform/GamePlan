import express from "express";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import teamsRoutes from "./routes/teams.routes";

/* Express App */ 
const app = express(); 

app.use(express.json()); 

/* Mount Api Routes */ 
app.use("/api", healthRoutes); 
app.use("/auth", authRoutes);
app.use("/teams", teamsRoutes);

export default app;
