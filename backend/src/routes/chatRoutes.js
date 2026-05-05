const express = require("express");
const { handleChatQuery } = require("../controllers/chatController");

const router = express.Router();

// POST /api/chat
router.post("/", handleChatQuery);

module.exports = router;
