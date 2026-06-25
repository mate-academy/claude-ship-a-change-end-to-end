const express = require("express");
const store = require("../db/store");

const router = express.Router();

// Email pattern: something@something.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate and normalize the body for create/update. Returns { error } with a
// message on failure, or { data: { name, email } } with trimmed values on success.
function validateUserInput(body) {
  const source = body || {};
  const name = typeof source.name === "string" ? source.name.trim() : "";
  const email = typeof source.email === "string" ? source.email.trim() : "";

  if (!name || !email) {
    return { error: "name and email are required" };
  }

  if (!EMAIL_RE.test(email)) {
    return { error: "email is invalid" };
  }

  return { data: { name, email } };
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
  const result = validateUserInput(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const user = store.createUser(result.data);
  res.status(201).json(user);
});

// PUT /users/:id — update an existing user; name and email are required
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = validateUserInput(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const user = store.updateUser(id, result.data);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
