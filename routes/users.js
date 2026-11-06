const express = require("express");
const store = require("../db/store");

const router = express.Router();

// Only plain digit strings are valid ids ("1"), not "0x1", "1.0" or "abc".
// Anything else becomes NaN, which matches no user and so ends up as a 404.
function parseId(raw) {
  return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

// Shared by POST and PUT: name and email must be non-empty strings.
// Returns the trimmed fields, or null if the input is invalid.
function parseUserInput(body) {
  const { name, email } = body || {};
  const isValid = (value) => typeof value === "string" && value.trim() !== "";

  if (!isValid(name) || !isValid(email)) return null;
  return { name: name.trim(), email: email.trim() };
}

const INVALID_INPUT_ERROR = {
  error: "name and email are required and must be non-empty strings",
};

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const user = store.getUserById(parseId(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users — create a user; name and email must be non-empty strings
router.post("/", (req, res) => {
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json(INVALID_INPUT_ERROR);
  }

  res.status(201).json(store.createUser(input));
});

// PUT /users/:id — update a user; name and email must be non-empty strings
router.put("/:id", (req, res) => {
  const input = parseUserInput(req.body);

  if (!input) {
    return res.status(400).json(INVALID_INPUT_ERROR);
  }

  const user = store.updateUser(parseId(req.params.id), input);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
