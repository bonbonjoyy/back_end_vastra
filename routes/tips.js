//backend/routes/product.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { 
  createTips, 
  updateTips, 
  getTips, 
  deleteTips
} = require("../controller/tipsController");


const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint CRUD Produk
router.get("/", getTips);
router.post("/", upload.single("image"), createTips);
router.patch("/:id", upload.single("image"), updateTips);
router.delete("/:id", deleteTips);

// router.get("/category/:category", getProductsByCategory);
// router.get("/:id", getProductById);

module.exports = router;

