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
    const { judul, kategori,deskripsi,urutan,image } = req.body;
    const tips = await Tips.create({ judul, kategori,deskripsi,urutan, image });
    res.status(201).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah tips" });
  }
};

// const updateTips = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { judul, kategori,deskripsi,urutan,image } = req.body;
//     const existingTips = await Tips.findByPk(id);

//     if (!existingTips) {
//       return res.status(404).json({ message: "Tips tidak ditemukan." });
//     }

//     if (!judul || !kategori || !deskripsi ||!urutan || !image) {
//       return res.status(400).json({ message: "Semua data harus diisi." });
//     }

//     const updatedTips = await Tips.update(
//       { judul, kategori, deskripsi, urutan, image: imagePath },
//       { where: { id } }
//     );

//     if (!updatedTips) {
//       return res.status(404).json({ message: "Tips tidak ditemukan." });
//     }

//     res.status(200).json({ message: "Tips berhasil diperbarui." });
//   } catch (err) {
//     console.error("Error saat mengupdate Tips:", err);
//     res.status(500).json({ message: "Terjadi kesalahan server." });
//   }
// };

const updateTips = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Data yang akan diperbarui
    const existingTips = await Tips.findByPk(id);

    if (!existingTips) {
      return res.status(404).json({ message: "Tips tidak ditemukan." });
    }

    // Cek apakah ada data yang dikirim untuk diupdate
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang dikirim untuk diperbarui." });
    }

    // Cek apakah semua field yang diperlukan ada
    const { judul, kategori, deskripsi, urutan, image } = updateData;
    if (!judul || !kategori || !deskripsi || !urutan || !image) {
      return res.status(400).json({ message: "Semua data harus diisi." });
    }

    // Update hanya field yang dikirim dalam request
    await Tips.update(updateData, { where: { id } });

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


