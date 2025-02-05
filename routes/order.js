// backend/routes/order.js
const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const path = require("path");
const {  
  getOrder,
  getOrdersByUserId,
  getOrderDetail,
  uploadImage,
  updateOrderStatus
} = require("../controller/orderController");

const router = express.Router();



router.get("/", getOrder);

router.get("/user/:userId", authMiddleware, getOrdersByUserId);
router.get("/user/me", authMiddleware, getOrdersByUserId);

router.get("/:orderId", authMiddleware, getOrderDetail);

// Pastikan rute ini ada dan di-register dengan benar
router.post("/upload/:orderId", authMiddleware, upload.single("image"), uploadImage);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
