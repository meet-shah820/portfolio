import app from "../api/index.js";

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

