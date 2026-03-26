import app from "./app";
import { config } from "./config/env";

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});