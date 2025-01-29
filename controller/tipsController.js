//backend/controller/tipsController.js
const { Tips } = require("../models");
const path = require("path");
const fs = require("fs");

const getTips = async (req, res) => {
  try {
    const tips = await Tips.findAll();
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil tips" });
  }
};

const createTips = async (req, res) => {
  try {
    const { judul, kategori,deskripsi,urutan } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const tips = await Tips.create({ judul, kategori,deskripsi,urutan, image: imagePath });
    res.status(201).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah tips" });
  }
};

const updateTips = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, kategori,deskripsi,urutan } = req.body;
    const existingTips = await Tips.findByPk(id);

    if (!existingTips) {
      return res.status(404).json({ message: "Tips tidak ditemukan." });
    }

    if (!judul || !kategori || !deskripsi ||!urutan) {
      return res.status(400).json({ message: "Semua data harus diisi." });
    }

    // Handle image update
    let imagePath = existingTips.image; // Default to the old image path
    if (req.file) {
      // Delete the old image if there's a new one
      if (existingTips.image) {
        const oldImagePath = path.join(__dirname, "../public", existingTips.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image from disk
        }
      }
      imagePath = `/uploads/${req.file.filename}`; // Set new image path
    }

    const updatedTips = await Tips.update(
      { judul, kategori,deskripsi,urutan, image: imagePath },
      { where: { id } }
    );

    if (!updatedTips) {
      return res.status(404).json({ message: "Tips tidak ditemukan." });
    }

    res.status(200).json({ message: "Tips berhasil diperbarui." });
  } catch (err) {
    console.error("Error saat mengupdate Tips:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


const deleteTips = async (req, res) => {
  try {
    const { id } = req.params;
    const tips = await Tips.findByPk(id);

    if (!tips) return res.status(404).json({ message: "Tips tidak ditemukan" });

    if (tips.image) {
      const imagePath = path.join(__dirname, "../public", tips.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await tips.destroy();
    res.status(200).json({ message: "Tips berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus Tips" });
  }
};

module.exports = { 
  getTips, 
  createTips, 
  updateTips, 
  deleteTips,
};


