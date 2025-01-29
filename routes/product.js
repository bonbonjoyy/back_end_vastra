//backend/routes/product.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { 
  createProduct, 
  updateProduct, 
  getProducts, 
  deleteProduct, 
  getProductsByCategory,
  getProductById
} = require("../controller/productController");


const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint CRUD Produk
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);
router.patch("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

// Endpoint untuk mendapatkan produk berdasarkan kategori
router.get("/category/:category", getProductsByCategory);

module.exports = router;

