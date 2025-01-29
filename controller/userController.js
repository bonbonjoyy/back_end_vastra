const jwt = require('jsonwebtoken');
const { User } = require("../models"); // Pastikan untuk import User model
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const {kirimEmail } = require('../helpers');

const loginUser = async (req, res) => {
  const { email, username, kata_sandi } = req.body;

  try {
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email },  // Cari berdasarkan email
          { username }, // atau username
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Username or email or password is incorrect' });
    }

    const isMatch = await bcrypt.compare(kata_sandi, user.kata_sandi);
    if (!isMatch) {
      return res.status(400).json({ message: 'Username or email or password is incorrect' });
    }

    const token = jwt.sign(
      { user: { id: user.id, email: user.email, username: user.username, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const response = await User.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!response) {
      // Jika data tidak ditemukan, kirimkan pesan error
      return res.status(404).json({ message: "User not found" });
    }

    // Membuat token untuk user yang ditemukan
    const token = jwt.sign(
      { user: { id: response.id, username: response.username } },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Kembalikan response dengan data user dan token
    res.status(200).json({
      token, // Token JWT
      user: {
        id: response.id,
        username: response.username,
      },
    });
  } catch (error) {
    console.log(error.message);
    // Tangani kesalahan lain dan kirimkan status 500 dengan pesan error
    res.status(500).json({ message: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const { nama_lengkap, email, username, kata_sandi, role } = req.body;

  try {
    // Validasi field yang wajib diisi
    if (!nama_lengkap || !email || !username || !kata_sandi) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Validasi apakah username sudah ada
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Validasi apakah email sudah ada
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);

    // Default role jika tidak diberikan
    const userRole = role || "user";

    // Menyimpan data user baru
    const user = await User.create({
      nama_lengkap,
      email,
      username,
      kata_sandi: hashedPassword, // Password langsung disimpan tanpa enkripsi
      role: userRole,
      profile_image: req.file ? `/uploads/${req.file.filename}` : null, // Gambar profil jika ada
    });

    // Response jika user berhasil dibuat
    res.status(201).json({
      message: "User berhasil dibuat",
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        username: user.username,
        role: user.role,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};


const updateUser  = async (req, res) => {
  try {
    // Ambil ID pengguna dari token
    const userIdFromToken = req.user.id; // Pastikan req.user diisi oleh middleware

    // Ambil ID dari parameter
    const { id } = req.params;

    // Pastikan ID dari parameter sama dengan ID dari token
    if (userIdFromToken !== id) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { sandi_saat_ini, kata_sandi } = req.body; // Ambil sandi saat ini dari body
    const user = await User.findByPk(id);

    // Validasi kata sandi saat ini
    if (sandi_saat_ini) {
      const isMatch = await bcrypt.compare(sandi_saat_ini, user.kata_sandi);
      if (!isMatch) {
        return res.status(401).json({ message: "Sandi saat ini tidak valid" });
      }
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.profile_image = `/uploads/${req.file.filename}`;
    }

    // Hash kata sandi baru jika diberikan dalam update
    if (kata_sandi) {
      updates.kata_sandi = await bcrypt.hash(kata_sandi, 10);
    } else {
      delete updates.kata_sandi; // Hapus kata_sandi jika kosong
    }

    await User.update(updates, {
      where: { id },
    });

    const updatedUser  = await User.findByPk(id);
    res.status(200).json({
      message: "User  berhasil diupdate",
      user: updatedUser ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal update user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Periksa apakah email ada dalam permintaan
    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email harus diisi.',
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Email tidak tersedia.',
      });
    }

    // Generate token reset password
    const token = jwt.sign(
      { iduser: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Perbarui field `resetPasswordLink` pada user
    user.resetPasswordLink = token;
    await user.save();

    const templateEmail = {
      from: 'Admin Vastra',
      to: email,
      subject: 'Link Reset Password',
      html: `
      <p>Silahkan klik link dibawah untuk reset password anda</p> 
      <p><a href="${process.env.CLIENT_URL}/resetpassword/${token}">Reset Password</a></p>
      `
    }
    kirimEmail(templateEmail)

    return res.status(200).json({
      status: true,
      message: `Link reset password berhasil terkirim ${email}.`,
      token: token,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan server.',
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log('token', token);
  console.log('newPassword', newPassword);

  try {
    // Cari pengguna berdasarkan token resetPasswordLink
    const user = await User.findOne({
      where: { resetPasswordLink: token },
    });

    // Jika pengguna tidak ditemukan
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Token tidak valid atau pengguna tidak ditemukan.',
      });
    }

    // Validasi token menggunakan jsonwebtoken
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Jika token valid, enkripsi password baru dan perbarui
      const encryptedPassword = await bcrypt.hash(newPassword, 10); // Mengenkripsi password baru dengan bcrypt

      user.kata_sandi = encryptedPassword; // Set password terenkripsi
      user.resetPasswordLink = ''; // Kosongkan resetPasswordLink setelah reset berhasil
      await user.save(); // Simpan perubahan ke database

      return res.status(200).json({
        status: true,
        message: 'Password berhasil diperbarui.',
      });
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: 'Token kadaluarsa atau tidak valid.',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};


module.exports = {
  loginUser,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
};
