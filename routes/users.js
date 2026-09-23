const express = require("express");
const store = require("../db/store");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_PATTERN = /^\d+$/;

// Parses a route :id param strictly: only digits count as a valid id
// (so "0x2", "1.0", "1e0" etc. are rejected rather than silently coerced).
function parseId(param) {
  return ID_PATTERN.test(param) ? Number(param) : null;
}

// Returns an error message for an invalid { name, email } body, or null if it's valid
function validateUserInput({ name, email } = {}) {
  if (name === undefined || email === undefined) {
    return "name and email are required";
  }
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return "name and email must be non-empty strings";
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "email must be a valid email address";
  }
  return null;
}

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  const user = id === null ? undefined : store.getUserById(id);

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

// PUT /users/:id — update a user's name and email, or 404 if it doesn't exist
router.put("/:id", (req, res) => {
  const id = parseId(req.params.id);
  const error = validateUserInput(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const user = id === null
    ? undefined
    : store.updateUser(id, {
        name: req.body.name.trim(),
        email: req.body.email.trim(),
      });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
