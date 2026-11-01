const express = require("express");

const usersRoutes = require("./routes/users");
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());

app.use("/users", usersRoutes);
app.use("/health", healthRoutes);

// Turn errors into JSON like every other error response. Client errors
// (malformed JSON, bad URL encoding, oversized body) keep their 4xx status;
// anything else is logged and reported as a generic 500.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  if (status >= 400 && status < 500) {
    const message = status === 413 ? "Request body too large" : "Malformed request";
    return res.status(status).json({ error: message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

// Only start the server when this file is run directly (e.g. `npm run dev`),
// so the tests can import `app` without opening a real port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
