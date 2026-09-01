const express = require("express");
const store = require("../db/store");

const router = express.Router();

// A pragmatic check: something before the @, something after it, and a dot in
// the domain. Full RFC-correct email validation is not worth the complexity here.
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

// PUT /users/:id — replace an existing user's name and email
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "name is required and must be a non-empty string" });
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return res
      .status(400)
      .json({ error: "email is required and must be a valid email address" });
  }

  const id = Number(req.params.id);
  const user = store.updateUser({ id, name: name.trim(), email: email.trim() });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
