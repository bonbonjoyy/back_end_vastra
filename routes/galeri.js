//backend/routes/galeri.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { 
  createGaleri, 
  updateGaleri, 
  getGaleri, 
  deleteGaleri,
  getGaleriSubCategory
} = require("../controller/galeriController");


const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint CRUD Produk
router.get("/", getGaleri);
router.post("/", upload.single("image"), createGaleri);
router.patch("/:id", upload.single("image"), updateGaleri);
router.delete("/:id", deleteGaleri);

// router.get("/subCategory/:subCategory", getGaleriSubCategory); 
router.get("/kategori/:kategori/subCategory/:subCategory", getGaleriSubCategory);

 

module.exports = router;

