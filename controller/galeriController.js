//backend/controller/galeriController.js
const { Galeri } = require("../models");
const path = require("path");
const fs = require("fs");

const getGaleri = async (req, res) => {
  try {
    const galeri = await Galeri.findAll();
    res.status(200).json(galeri);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil Galeri" });
  }
};

const createGaleri = async (req, res) => {
  try {
    const { title, kategori, sub_kategori, image } = req.body;
    const galeri = await Galeri.create({ title, kategori, sub_kategori, image });
    res.status(201).json(galeri);
  } catch (error) {
    console.error("Error creating galeri:", error);
    res.status(500).json({ message: "Gagal menambah Galeri" });
  }
};
  
  const updateGaleri = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body; // Data yang akan diperbarui
      const existingGaleri = await Galeri.findByPk(id);
  
      if (!existingGaleri) {
        return res.status(404).json({ message: "Tips tidak ditemukan." });
      }
  
      // Cek apakah ada data yang dikirim untuk diupdate
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "Tidak ada data yang dikirim untuk diperbarui." });
      }
  
      // Cek apakah semua field yang diperlukan ada
      const { title, kategori, sub_kategori, image } = updateData;
      if (!title || !kategori || !sub_kategori || !image) {
        return res.status(400).json({ message: "Semua data harus diisi." });
      }
  
      // Update hanya field yang dikirim dalam request
      await Galeri.update(updateData, { where: { id } });
  
      res.status(200).json({ message: "Galeri berhasil diperbarui." });
    } catch (err) {
      console.error("Error saat mengupdate Galeri:", err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  };

const deleteGaleri = async (req, res) => {
  try {
    const { id } = req.params;
    const galeri = await Galeri.findByPk(id);

    if (!galeri) return res.status(404).json({ message: "Galeri tidak ditemukan" });

    if (galeri.image) {
      const imagePath = path.join(__dirname, "../public", galeri.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await galeri.destroy();
    res.status(200).json({ message: "Galeri berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus Galeri" });
  }
};

const getGaleriSubCategory = async (req, res) => {
    const { kategori, subCategory } = req.params; // Ambil kategori dan subCategory dari params
  
    try {
      console.log("Fetching products for category:", kategori, "and subCategory:", subCategory); // Debug log
  
      const galeri = await Galeri.findAll({
        where: { 
          kategori: kategori, // Menambahkan filter berdasarkan kategori
          sub_kategori: subCategory // Menambahkan filter berdasarkan subkategori
        },
      });
  
      if (galeri.length === 0) {
        // Jika tidak ada data, kembalikan array dengan satu objek berisi null di setiap properti
        return res.json([{
          id: null,
          title: null,
          kategori: null,
          sub_kategori: null,
          image: null,
        }]);
      }
  
      res.json(galeri);
    } catch (error) {
      console.error("Error fetching galeri by category and subCategory:", error); // Debug log
      res.status(500).json({ message: "Error fetching galeri by category and subCategory", error: error.message });
    }
  };
  
module.exports = { 
  getGaleri, 
  createGaleri, 
  updateGaleri, 
  deleteGaleri,
  getGaleriSubCategory
};


