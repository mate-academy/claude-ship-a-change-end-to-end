const express = require("express");
const store = require("../db/store");

const router = express.Router();

// Deliberately simple check: something@something.tld, no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

// PUT /users/:id — replace name and email of an existing user.
// Both fields are required; 400 if one is missing or invalid, 404 if the user doesn't exist.
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";

  if (!cleanName) {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return res.status(400).json({ error: "email is required and must be a valid email address" });
  }

  const id = Number(req.params.id);
  const user = store.updateUser(id, { name: cleanName, email: cleanEmail });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
