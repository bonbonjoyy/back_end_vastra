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
    const { nama_product, harga, stok, deskripsi,kategori } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({ nama_product, harga, stok, deskripsi,kategori, image: imagePath });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_product, deskripsi, harga, stok, kategori } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // Jika ada gambar baru, hapus gambar lama
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(__dirname, "../public", product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    // Perbarui data produk
    product.nama_product = nama_product;
    product.deskripsi = deskripsi;
    product.harga = harga;
    product.stok = stok;
    product.kategori = kategori;

    await product.save();

    res.status(200).json({ message: "Produk berhasil diperbarui.", product });
  } catch (err) {
    console.error("Error saat mengupdate produk:", err);
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


