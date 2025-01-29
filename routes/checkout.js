//backend/routes/checkout.js
const express = require("express");
const router = express.Router();
const checkoutController = require("../controller/checkoutController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, checkoutController);

module.exports = router;
