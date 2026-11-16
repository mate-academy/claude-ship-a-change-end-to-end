const express = require("express");
const store = require("../db/store");

const router = express.Router();

// name and email must be non-empty strings, and email needs a basic shape
function isValidUserInput({ name, email }) {
  return (
    typeof name === "string" &&
    name.trim() !== "" &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+$/.test(email)
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

// POST /users — create a user; name and a valid email are required
router.post("/", (req, res) => {
  const { name, email } = req.body || {};

  if (!isValidUserInput({ name, email })) {
    return res
      .status(400)
      .json({ error: "name and a valid email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

// PUT /users/:id — update a user; name and a valid email are required, 404 if missing
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id must be an integer" });
  }

  if (!isValidUserInput({ name, email })) {
    return res
      .status(400)
      .json({ error: "name and a valid email are required" });
  }

  const user = store.updateUser(id, { name, email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
