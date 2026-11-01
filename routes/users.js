const express = require("express");
const store = require("../db/store");
const config = require("../config");
const validateId = require("../middleware/validateId");
const { requireUserId } = validateId;
const { validateUserInput } = require("../utils");

const router = express.Router();

// Validate :id (format and range) for the endpoints listed in config.
router.param("id", validateId(config.idValidatedEndpoints));

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", requireUserId, (req, res) => {
  const user = store.getUserById(req.userId);

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

  try {
    const user = store.createUser(data);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof RangeError) {
      return res.status(507).json({ error: err.message });
    }
    throw err;
  }
});

// PUT /users/:id — replace a user's name and email; 400 on bad input, 404 if missing
router.put("/:id", requireUserId, (req, res) => {
  const { error, data } = validateUserInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const user = store.updateUser(req.userId, data);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
