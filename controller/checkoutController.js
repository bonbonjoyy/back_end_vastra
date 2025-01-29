//backend/controller/cjheckoutController.js
const { Order, User } = require("../models");

const checkoutController = async (req, res) => {
  const { items, shipping_details, total, paymentMethod } = req.body;
  const userId = req.user.id; // Ambil user ID dari token

  try {
    // Validasi data
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong." });
    }

    if (!shipping_details || !total || !paymentMethod) {
      return res.status(400).json({ message: "Data checkout tidak lengkap." });
    }

    // Pastikan user ada
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Buat pesanan baru
    const newOrder = await Order.create({
      user_id: userId,
      items: JSON.stringify(items),
      shipping_details: JSON.stringify(shipping_details),
      total,
      paymentMethod,
    });

    return res
      .status(201)
      .json({ message: "Pesanan berhasil dibuat.", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Gagal memproses pesanan." });
  }
};

module.exports = checkoutController;
