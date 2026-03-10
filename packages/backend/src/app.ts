import express from "express";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";

const app = express(); // express app

app.use(express.json()); // middleware that converts incoming JSON HTTP request into a useable object 

/* Mount Api Routes */ 
app.use("/api", healthRoutes); 
app.use("/auth", authRoutes);

export default app;
