//backend/controller/kreasiController.js
const { Kreasi } = require("../models");
const path = require("path");
const fs = require("fs");

const getKreasis = async (req, res) => {
  try {
    const kreasis = await Kreasi.findAll();
    res.status(200).json(kreasis);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil produk" });
  }
};

const createKreasi = async (req, res) => {
  try {
    const { kulit, badan, image } = req.body;
    const kreasi = await Kreasi.create({ kulit,badan, image });
    res.status(201).json(kreasi);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah kreasi" });
  }
};

// const updateKreasi = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { kulit, badan } = req.body;
//     const existingKreasi = await Kreasi.findByPk(id);

//     if (!existingKreasi) {
//       return res.status(404).json({ message: "Kreasi tidak ditemukan." });
//     }

//     // if (!kulit || !badan) {
//     //   return res.status(400).json({ message: "Semua data harus diisi." });
//     // }

//     // Handle image update
//     let imagePath = existingKreasi.image; // Default to the old image path
//     if (req.file) {
//       // Delete the old image if there's a new one
//       if (existingKreasi.image) {
//         const oldImagePath = path.join(__dirname, "../public", existingKreasi.image);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath); // Delete old image from disk
//         }
//       }
//       imagePath = `/uploads/${req.file.filename}`; // Set new image path
//     }

//     const updatedKreasi = await Kreasi.update(
//       { kulit, badan, image: imagePath },
//       { where: { id } }
//     );

//     if (!updatedKreasi) {
//       return res.status(404).json({ message: "Kreasi tidak ditemukan." });
//     }

//     res.status(200).json({ message: "Kreasi berhasil diperbarui." });
//   } catch (err) {
//     console.error("Error saat mengupdate kreasi:", err);
//     res.status(500).json({ message: "Terjadi kesalahan server." });
//   }
// };


const updateKreasi = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Data yang akan diperbarui
    const existingKreasi = await Kreasi.findByPk(id);

    if (!existingKreasi) {
      return res.status(404).json({ message: "Kreasi tidak ditemukan." });
    }

    // Cek apakah ada data yang dikirim untuk diupdate
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang dikirim untuk diperbarui." });
    }

    // Cek apakah semua field yang diperlukan ada
    const { kulit, badan, image } = updateData;
    if (!kulit || !badan || !image) {
      return res.status(400).json({ message: "Semua data harus diisi." });
    }

    // Update hanya field yang dikirim dalam request
    await Kreasi.update(updateData, { where: { id } });

    res.status(200).json({ message: "Kreasi berhasil diperbarui." });
  } catch (err) {
    console.error("Error saat mengupdate Kreasi:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


const deleteKreasi = async (req, res) => {
  try {
    const { id } = req.params;
    const kreasi = await Kreasi.findByPk(id);

    if (!kreasi) return res.status(404).json({ message: "Kreasi tidak ditemukan" });

    if (kreasi.image) {
      const imagePath = path.join(__dirname, "../public", kreasi.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await kreasi.destroy();
    res.status(200).json({ message: "Kreasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus Kreasi" });
  }
};

module.exports = { 
  getKreasis, 
  createKreasi, 
  updateKreasi, 
  deleteKreasi,
};


