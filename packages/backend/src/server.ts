import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`The server is running on port ${config.port}`); // startup log
});
