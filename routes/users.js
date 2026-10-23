const express = require("express");
const store = require("../db/store");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserInput({ name, email }) {
  if (name === undefined || name === null) {
    return { field: "name", error: "Please provide a name for the user." };
  }
  if (typeof name !== "string") {
    return { field: "name", error: 'The name must be text, for example "Ada Lovelace".' };
  }
  if (!name.trim()) {
    return { field: "name", error: "The name can't be blank. Please enter the user's name." };
  }
  if (email === undefined || email === null) {
    return { field: "email", error: "Please provide an email address for the user." };
  }
  if (typeof email !== "string") {
    return {
      field: "email",
      error: 'The email address must be text, for example "ada@example.com".',
    };
  }
  if (!email.trim()) {
    return { field: "email", error: "The email address can't be blank. Please enter one." };
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return {
      field: "email",
      error: 'That doesn\'t look like a valid email address. Try something like "ada@example.com".',
    };
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

// PUT /users/:id — replace a user's name and email; 400 on invalid input, 404 if missing
router.put("/:id", (req, res) => {
  const problem = validateUserInput(req.body);
  if (problem) {
    return res.status(400).json(problem);
  }

  const user = store.updateUser(Number(req.params.id), {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
  });

  if (!user) {
    return res.status(404).json({
      error: `We couldn't find a user with id "${req.params.id}". Check the id and try again.`,
    });
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

module.exports = router;
