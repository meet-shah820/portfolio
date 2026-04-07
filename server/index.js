import app from "../api/index.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});

