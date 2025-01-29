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

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/", getOrder);

router.get("/user/:userId", authMiddleware, getOrdersByUserId);
router.get("/user/me", authMiddleware, getOrdersByUserId);

router.get("/:orderId", authMiddleware, getOrderDetail);

// Pastikan rute ini ada dan di-register dengan benar
router.post("/upload/:orderId", authMiddleware, upload.single("image"), uploadImage);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
