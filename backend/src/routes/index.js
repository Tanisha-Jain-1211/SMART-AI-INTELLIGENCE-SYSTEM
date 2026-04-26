// Registers API routes exposed under /api.
const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

module.exports = router;
