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

// PUT /users/:id — replace a user's name and email; 400 on bad input, 404 if missing
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const { name, email } = req.body || {};
  const errors = [];

  if (typeof name !== "string" || name.trim() === "") {
    errors.push("name is required and must be a non-empty string");
  }
  if (typeof email !== "string" || email.trim() === "") {
    errors.push("email is required and must be a non-empty string");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("email must be a valid email address");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  const user = store.updateUser(id, {
    name: name.trim(),
    email: email.trim(),
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
