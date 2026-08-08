const express = require("express");
const store = require("../db/store");

const router = express.Router();

// A user's details are valid only if both fields are non-blank strings. A JSON
// body can hold any type, so a truthiness check alone would let an object or an
// array through and store it as a name.
function isValidDetails({ name, email }) {
  return [name, email].every(
    (value) => typeof value === "string" && value.trim() !== "",
  );
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

  if (!isValidDetails({ name, email })) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

// PUT /users/:id — replace a user's details; name and email are required
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  if (!isValidDetails({ name, email })) {
    return res.status(400).json({ error: "name and email are required" });
  }

  // `Number` also reads "0x2", "2.0" and " 2" as 2, which would let a caller
  // write to user 2 through a URL that isn't that user's. Check the raw text.
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = store.updateUser(id, { name, email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
