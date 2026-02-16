const express = require("express");
const { allMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

router.get("/", protect, allMessages);
router.post("/", protect, sendMessage);

module.exports = router;