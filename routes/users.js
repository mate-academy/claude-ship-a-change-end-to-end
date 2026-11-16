const express = require("express");
const store = require("../db/store");

const router = express.Router();

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
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate a full user payload. Returns { error } or { value } with trimmed
// strings. Unknown fields (e.g. id) are dropped.
function validateUserInput(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const { name, email } = body;

  if (name === undefined || email === undefined) {
    return { error: "name and email are required" };
  }
  if (typeof name !== "string" || typeof email !== "string") {
    return { error: "name and email must be strings" };
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (!cleanName) return { error: "name must not be empty" };
  if (cleanName.length > NAME_MAX) {
    return { error: `name must be at most ${NAME_MAX} characters` };
  }
  if (cleanEmail.length > EMAIL_MAX || !EMAIL_RE.test(cleanEmail)) {
    return { error: "email must be a valid email address" };
  }

  return { value: { name: cleanName, email: cleanEmail } };
}

// PUT /users/:id — replace a user's name and email (both required)
router.put("/:id", (req, res) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  const id = Number(req.params.id);

  const { error, value } = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.updateUser(id, value);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
