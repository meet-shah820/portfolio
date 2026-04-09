import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load env for local dev BEFORE importing the API module (it reads env at import time).
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const dotEnvPath = path.join(SERVER_DIR, ".env");
const exampleEnvPath = path.join(SERVER_DIR, "env.example");

dotenv.config({ path: dotEnvPath });
if (!process.env.MONGODB_URI && fs.existsSync(exampleEnvPath)) {
  dotenv.config({ path: exampleEnvPath, override: false });
}

const { default: app } = await import("../api/index.js");

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});

server.on("error", (err) => {
  if (err && typeof err === "object" && err.code === "EADDRINUSE") {
    console.error(
      `[api] port ${PORT} is already in use. Stop the process using it, or run with PORT=<free_port>.`
    );
    process.exit(1);
  }
  throw err;
});

