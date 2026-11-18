const express = require("express");
const store = require("../db/store");
const { validateUserInput, parseId } = require("../validators/user");

const router = express.Router();

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const user = store.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users — create a user; name and email are required and validated
// the same way as in PUT /users/:id
router.post("/", (req, res) => {
  const error = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.createUser({
    name: req.body.name.trim(),
    email: req.body.email.trim(),
  });
  res.status(201).json(user);
});

// PUT /users/:id — replace a user's name and email; both are required
router.put("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const error = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.updateUser(id, {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
