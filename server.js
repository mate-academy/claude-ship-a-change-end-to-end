const express = require("express");

const usersRoutes = require("./routes/users");
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());

app.use("/users", usersRoutes);
app.use("/health", healthRoutes);

// Malformed JSON bodies bubble up here as a body-parser error; turn that
// into the same kind of clear, JSON error the routes return, instead of
// letting Express's default HTML/stack-trace error page through.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }
  next(err);
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
