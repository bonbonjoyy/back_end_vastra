const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Sequelize } = require("../models");
const { Op } = require('sequelize');
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const router = express.Router();
const googleClient = require("../config/googleAuth");

router.post('/login', async (req, res) => {
  console.log("Request body:", req.body); // Tambahkan log ini
  const { email, kata_sandi } = req.body; // Hanya ambil email dan kata_sandi

  // Validasi input
  if (!email || !kata_sandi) {
    return res.status(400).json({ message: "Email dan kata sandi harus diisi" });
  }

  try {
    // Menemukan user berdasarkan email
    const user = await User.findOne({
      where: {
        email: email, // Cek apakah email cocok
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Email atau kata sandi salah' });
    }

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(kata_sandi, user.kata_sandi); // Compare hashed password
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau kata sandi salah' });
    }

    // Update last_login
    const isFirstLogin = !user.last_login; // Cek apakah ini login pertama
    await User.update({ last_login: new Date() }, { where: { id: user.id } });

    // Generate JWT token
    const token = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // Token berlaku selama 12 jam
    );

    // Kirim respons
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isFirstLogin, // Informasi apakah ini login pertama
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, kata_sandi, role } = req.body;

    // Menetapkan role default menjadi 'user' jika tidak ada
    const userRole = role && (role === 'admin' || role === 'user') ? role : 'user';

    // Cek apakah username atau email sudah terdaftar
    const userExists = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "Email atau username sudah terdaftar",
      });
    }

    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(kata_sandi, 10); // 10 adalah salt rounds

    // Menyimpan user baru ke dalam database
    const user = await User.create({
      username,
      email,
      kata_sandi: hashedPassword,  // Simpan hashed password
      role: userRole,  // Menyimpan role yang diberikan
      last_login: null,
    });

    // Membuat token JWT untuk user yang baru saja terdaftar
    const token = jwt.sign(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }  // Token berlaku selama 12 jam
    );

    // Mengirim response dengan token dan informasi user
    res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat registrasi",
    });
  }
});

// Simplified reset password without email
router.post("/reset-password-direct", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ kata_sandi: hashedPassword }, { where: { id: user.id } });

    res.json({ message: "Password berhasil direset" });
  } catch (error) {
    res.status(500).json({ message: "Gagal mereset password" });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Cari user berdasarkan email
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Jika user belum ada, buat user baru
      user = await User.create({
        username: email.split("@")[0], // Gunakan bagian depan email sebagai username
        email,
        nama_lengkap: name,
        profile_image: picture,
        role: "user",
        kata_sandi: Math.random().toString(36).slice(-8), // Generate random password
        is_google_account: true,
      });
    }

    // Update last_login
    await User.update({ last_login: new Date() }, { where: { id: user.id } });

    const jwtToken = jwt.sign(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil",
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_google_account: true,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat login dengan Google",
    });
  }
});

module.exports = router;
