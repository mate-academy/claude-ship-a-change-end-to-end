const express = require("express");
const store = require("../db/store");

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

// Only plain positive integers ("1", "42") are valid ids; "abc", "0x1", "1.0"
// and "1e0" are rejected instead of being coerced by Number().
function isValidId(value) {
  return /^[1-9]\d*$/.test(value);
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

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

// PUT /users/:id — replace a user's name and email; 400 on bad input, 404 if missing
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    return res
      .status(400)
      .json({ error: "name and email are required and must be non-empty strings" });
  }

  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const id = Number(req.params.id);
  const user = store.updateUser(id, { name: name.trim(), email: email.trim() });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
