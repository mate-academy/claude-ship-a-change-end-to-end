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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUT /users/:id — update a user; name and email are required and the email
// must be valid. Validation runs before the lookup, so a bad body is a 400
// even for an id that doesn't exist.
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";

  if (!cleanName || !cleanEmail) {
    return res.status(400).json({ error: "name and email are required" });
  }

  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }

  const result = store.updateUser(id, { name: cleanName, email: cleanEmail });

  if (result === store.USER_NOT_FOUND) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result);
});

module.exports = router;
