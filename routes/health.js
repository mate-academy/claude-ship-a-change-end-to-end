const express = require("express");

const router = express.Router();

// GET /health — simple liveness check
router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
