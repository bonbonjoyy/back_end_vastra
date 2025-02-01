//backend/controller/productController.js
const { Product } = require("../models");
const path = require("path");
const fs = require("fs");

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil produk" });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log untuk debug
    const { nama_product, harga, stok, deskripsi, kategori, image } = req.body;
    const product = await Product.create({ nama_product, harga, stok, deskripsi,kategori, image });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error saat menambah produk:", error); // Log error
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body; // Data yang akan diperbarui
      const existingProduct = await Product.findByPk(id);
  
      if (!existingProduct) {
        return res.status(404).json({ message: "Tips tidak ditemukan." });
      }
  
      // Cek apakah ada data yang dikirim untuk diupdate
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "Tidak ada data yang dikirim untuk diperbarui." });
      }
  
      // Cek apakah semua field yang diperlukan ada
      const { nama_product, deskripsi, harga, stok, kategori, image } = updateData;
      if (!nama_product || !deskripsi || !harga || !stok || !kategori || !image) {
        return res.status(400).json({ message: "Semua data harus diisi." });
      }
  
      // Update hanya field yang dikirim dalam request
      await Product.update(updateData, { where: { id } });
  
      res.status(200).json({ message: "Product berhasil diperbarui." });
    } catch (err) {
      console.error("Error saat mengupdate Product:", err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  };

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    if (product.image) {
      const imagePath = path.join(__dirname, "../public", product.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await product.destroy();
    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
};

const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    console.log("Fetching products for category:", category); // Log the category for debugging
    const products = await Product.findAll({
      where: { kategori: category },  // Ensure the 'kategori' field matches the database column
    });

    if (products.length === 0) {
      return res.status(404).json({ message: `No products found for category: ${category}` });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error); // Log error for debugging
    res.status(500).json({ message: "Error fetching products by category", error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari produk berdasarkan ID
    const product = await Product.findByPk(id);

    // Jika produk tidak ditemukan
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Kirim data produk
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil produk" });
  }
};

module.exports = { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductsByCategory,
  getProductById
};


