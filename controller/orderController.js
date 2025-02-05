//backend/controller/orderController.js
const { Order, Product } = require("../models");

const getOrder = async (req, res) => {
  try {
    const orders = await Order.findAll();

    // Memastikan data 'items' dan 'shipping_details' diparsing dua kali jika diperlukan
    const parsedOrders = orders.map(order => {
      const items = JSON.parse(order.items);
      const shippingDetails = JSON.parse(order.shipping_details);
      
      return {
        ...order.dataValues,
        items: JSON.parse(items),  // Parsing kedua jika perlu
        shipping_details: JSON.parse(shippingDetails)  // Parsing kedua
      };
    });

    res.status(200).json(parsedOrders);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil Order" });
  }
};


const getOrdersByUserId = async (req, res) => {
  const userId = req.user.id;  // Ambil userId dari token (req.user.id sudah dipasang oleh middleware)

  console.log("ID dari token:", userId);  // Untuk debug

  try {
    // Mengambil pesanan berdasarkan userId
    const orders = await Order.findAll({
      where: { user_id: userId },
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "Tidak ada pesanan untuk pengguna ini" });
    }

    // Mengembalikan data pesanan
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by user ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil pesanan" });
  }
};

const getOrderDetail = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Pastikan ID pengguna cocok dengan pemilik pesanan
    if (req.user.id !== order.user_id) {
      return res.status(403).json({ message: "Akses ditolak, ID pengguna tidak cocok" });
    }

    // Parsing 'items' dan 'shipping_details' jika diperlukan
    const items = order.items ? JSON.parse(order.items) : [];
    const shippingDetails = order.shipping_details ? JSON.parse(order.shipping_details) : {};

    // Mengirimkan data pesanan dengan parsed 'items' dan 'shipping_details'
    res.status(200).json({
      ...order.dataValues,
      items: items,
      shipping_details: shippingDetails,
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil detail pesanan" });
  }
};

// Fungsi untuk menangani upload gambar
const uploadImage = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Received orderId:", orderId);

    const file = req.file; // Mendapatkan file gambar dari request body
    console.log("Received file:", file);

    // Validasi file upload
    if (!file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }

    // Cek apakah orderId ada
    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Nama file unik berdasarkan orderId dan timestamp
    const fileName = `orders/${orderId}/${Date.now()}-${file.originalname}`;
    console.log("Uploading file to Supabase with name:", fileName);

    // Upload gambar ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('images') // Sesuaikan dengan nama bucket di Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return res.status(500).json({ message: "Gagal mengunggah gambar ke Supabase.", error: error.message });
    }

    // Ambil URL gambar dari Supabase Storage
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    console.log("Public URL retrieved:", publicUrl);

    // Update database dengan URL gambar
    order.image = publicUrl; // Simpan URL gambar
    order.status = "Waiting Confirm"; // Ubah status pesanan
    await order.save(); // Simpan perubahan ke database
    console.log("Order updated with new image URL and status.");

    // Mengembalikan response dengan URL gambar
    res.status(200).json({
      message: "Gambar berhasil diunggah dan status diperbarui!",
      image: publicUrl, // URL gambar dari Supabase
      status: order.status, // Status baru
    });
  } catch (err) {
    console.error("Error saat mengunggah gambar:", err);
    res.status(500).json({ message: "Gagal mengunggah gambar.", error: err.message });
  }
};



const updateOrderStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; 

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    order.status = status;
    await order.save();

    // Jika status pesanan diterima (Accepted), kita perbarui stok produk
    if (status === "Accepted") {
      for (const item of order.items) {
        const product = await Product.findByPk(item.id);
        if (product) {
          if (product.stok >= item.quantity) {
            product.stok -= item.quantity;
            await product.save(); 
            console.log(`Stok produk ${product.id} berhasil diperbarui. Sisa stok: ${product.stok}`);
          } else {
            console.error(`Stok produk ${product.id} tidak cukup.`);
            return res.status(400).json({ message: `Stok produk ${product.id} tidak cukup` });
          }
        } else {
          console.error(`Produk dengan ID ${item.id} tidak ditemukan`);
        }
      }
    }

    // Jika status pesanan ditolak (Rejected), tidak ada perubahan stok, cukup update status
    if (status === "Rejected") {
      console.log(`Pesanan ${order.id} telah ditolak.`);
    }

    res.status(200).json({ message: "Status order berhasil diperbarui", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Gagal memperbarui status order" });
  }
};


  
module.exports = { 
  getOrder,
  getOrdersByUserId,
  getOrderDetail,
  uploadImage,
  updateOrderStatus
};
