// Registers unauthenticated public endpoints (stats for landing page).
const express = require("express");
const publicController = require("../controllers/publicController");

const router = express.Router();

router.get("/stats", publicController.getPublicStats);

module.exports = router;
