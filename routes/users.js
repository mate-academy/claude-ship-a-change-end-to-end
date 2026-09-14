const express = require("express");
const store = require("../db/store");

const router = express.Router();

// Matches local@domain.tld, allowing multi-label domains (e.g. .co.uk).
const EMAIL_PATTERN =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

function isValidName(name) {
  return typeof name === "string" && name.trim().length > 0;
}

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
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
  const { name, email } = req.body;

  if (!isValidName(name) || !isValidEmail(email)) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name: name.trim(), email: email.trim() });
  res.status(201).json(user);
});

// PUT /users/:id — update an existing user; name and email are required
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!store.getUserById(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;

  if (!isValidName(name) || !isValidEmail(email)) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.updateUser(id, { name: name.trim(), email: email.trim() });
  res.json(user);
});

module.exports = router;
