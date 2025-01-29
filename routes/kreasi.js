//backend/routes/product.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { 
  createKreasi, 
  updateKreasi, 
  getKreasis, 
  deleteKreasi
} = require("../controller/kreasiController");


const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint CRUD Produk
router.get("/", getKreasis);
router.post("/", upload.single("image"), createKreasi);
router.patch("/:id", upload.single("image"), updateKreasi);
router.delete("/:id", deleteKreasi);

// router.get("/category/:category", getProductsByCategory);
// router.get("/:id", getProductById);

module.exports = router;

