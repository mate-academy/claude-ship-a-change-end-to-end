const express = require("express");
const store = require("../db/store");

const router = express.Router();

// A basic shape check (something@domain.tld), not full address validation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Only plain positive integers are ids. Number() alone would also turn forms
// like 0x1, 1.0 or 01 into 1, letting those URLs reach a real user.
function parseId(rawId) {
  return /^[1-9]\d*$/.test(rawId) ? Number(rawId) : undefined;
}

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
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

// PUT /users/:id — replace a user's name and email; 400 if either is invalid,
// 404 if the user doesn't exist
router.put("/:id", (req, res) => {
  const id = parseId(req.params.id);
  const { name, email } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }

  const user = store.updateUser(id, { name: name.trim(), email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
