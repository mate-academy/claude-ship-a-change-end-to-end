const express = require("express");
const store = require("../db/store");

const router = express.Router();

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

// PUT /users/:id � update a user; name and email are required
router.put("/:id", (req, res) => {
  const { name, email } = req.body || {};

  if (name === undefined || name === null || email === undefined || email === null) {
    return res.status(400).json({ error: "name and email are required" });
  }

  if (typeof name !== "string" || typeof email !== "string") {
    return res.status(400).json({ error: "name and email must be strings" });
  }

  if (name.trim() === "" || email.trim() === "") {
    return res.status(400).json({ error: "name and email are required" });
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: "email is invalid" });
  }

  // Only plain digits count as an id, so "1e0" or "0x1" don't match user 1.
  const user = /^\d+$/.test(req.params.id)
    ? store.updateUser(Number(req.params.id), {
        name: name.trim(),
        email: email.trim(),
      })
    : undefined;
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
