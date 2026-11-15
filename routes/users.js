const express = require("express");
const store = require("../db/store");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an error message for invalid input, or null when it is valid.
function validateUserInput({ name, email }) {
  if (typeof name !== "string" || name.trim() === "") {
    return "name is required and must be a non-empty string";
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "email is required and must be a valid email address";
  }

  return null;
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

// PUT /users/:id — replace a user's name and email; 404 if the user doesn't
// exist, 400 for invalid input
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!store.getUserById(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const input = req.body ?? {};
  const error = validateUserInput(input);

  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.updateUser(id, {
    name: input.name.trim(),
    email: input.email.trim(),
  });

  res.json(user);
});

module.exports = router;
