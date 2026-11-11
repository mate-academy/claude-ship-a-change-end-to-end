const express = require("express");
const store = require("../db/store");

const router = express.Router();

const INVALID_USER_MESSAGE =
  "name and email are required and must be non-empty strings";

// Shared by POST and PUT. Returns trimmed { name, email }, or null if either
// field is missing, not a string, or blank.
function parseUserInput(body) {
  const { name, email } = body || {};

  if (typeof name !== "string" || typeof email !== "string") {
    return null;
  }

  const trimmed = { name: name.trim(), email: email.trim() };
  return trimmed.name && trimmed.email ? trimmed : null;
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
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: INVALID_USER_MESSAGE });
  }

  const user = store.createUser(input);
  res.status(201).json(user);
});

// PUT /users/:id — update a user; name and email are required.
// 400 for invalid input, 404 if the user doesn't exist.
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: INVALID_USER_MESSAGE });
  }

  const user = store.updateUser(id, input);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
