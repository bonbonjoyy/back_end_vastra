//backend/routes/index.js
const express = require("express");
const authRoutes = require("./auth");
const userRoutes = require("./user");
const productRoutes = require("./product");
const kreasiRoutes = require("./kreasi");
const tipsRoutes = require("./tips");  
const galeriRoutes = require("./galeri");
const checkoutRoutes = require("./checkout");
const orderRoutes = require("./order");
const router = express.Router();
// const { updateProduct } = require("../controllers/productController");

// Route untuk auth (login & register)
router.use("/auth", authRoutes);

router.use("/api/users", userRoutes);

router.use("/api/products", productRoutes); 
router.use("/api/kreasis", kreasiRoutes); 
router.use("/api/tips", tipsRoutes);  
router.use("/api/galeris", galeriRoutes);  
router.use("/api/checkout", checkoutRoutes);  
router.use("/api/orders", orderRoutes);  

module.exports = router;
