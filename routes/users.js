const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser } = require("../db/store");

router.get("/", (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

router.post("/", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const user = createUser({ name, email });
  res.status(201).json(user);
});

router.get("/:id", (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Validation failed: missing fields" });
  }

  const existingUser = getUserById(id);
  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedUser = updateUser(id, { name, email });
  res.json(updatedUser);
});

module.exports = router;