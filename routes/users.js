const express = require("express");
const store = require("../db/store");

const router = express.Router();

// Validate a { name, email } body. Both must be non-empty strings (after
// trimming). Returns the trimmed values, or null if the body is invalid.
function parseUserInput(body) {
  const { name, email } = body || {};

  if (typeof name !== "string" || typeof email !== "string") return null;

  const trimmed = { name: name.trim(), email: email.trim() };
  if (!trimmed.name || !trimmed.email) return null;

  return trimmed;
}

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = store.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users — create a user; name and email are required
router.post("/", (req, res) => {
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser(input);
  res.status(201).json(user);
});

// PUT /users/:id — update a user; name and email are required, 404 if missing
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.updateUser(id, input);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
