const express = require("express");
const store = require("../db/store");
const { parseId, validateUserInput } = require("../utils");

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

// POST /users — create a user; name and email are required
router.post("/", (req, res) => {
  const { error, data } = validateUserInput(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.createUser(data);
  res.status(201).json(user);
});

module.exports = router;
