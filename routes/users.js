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

const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

// Shared by POST and PUT so both agree on what a valid user is. Returns the
// cleaned { name, email }, or null if either field is missing, not a string,
// or blank. A missing request body counts as empty.
function parseUserInput(body) {
  const { name, email } = body || {};

  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    return null;
  }

  return { name: name.trim(), email: email.trim() };
}

const INVALID_INPUT_ERROR = "name and email are required and must be non-empty strings";

// POST /users — create a user; name and email are required
router.post("/", (req, res) => {
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: INVALID_INPUT_ERROR });
  }

  const user = store.createUser(input);
  res.status(201).json(user);
});

// PUT /users/:id — update a user's name and email; both are required.
// Validates first (400), then looks the user up (404).
router.put("/:id", (req, res) => {
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json({ error: INVALID_INPUT_ERROR });
  }

  // Only plain digits count as an id, so "1.0", "0x1" and "1e0" can't alias user 1.
  const user = /^\d+$/.test(req.params.id)
    ? store.updateUser(Number(req.params.id), input)
    : undefined;

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
