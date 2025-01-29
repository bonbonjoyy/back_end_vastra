const jwt = require('jsonwebtoken');  // Menggunakan require untuk mengimpor jsonwebtoken

// Middleware untuk autentikasi menggunakan JWT
const authMiddleware = (req, res, next) => {
  // Ambil token dari header Authorization
  const token = req.header('Authorization');

  // Cek apakah token ada
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Menghilangkan kata 'Bearer ' dari token jika ada
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    // Verifikasi token menggunakan JWT_SECRET
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // Menyimpan data user dari token ke dalam request untuk digunakan pada controller berikutnya
    req.user = decoded.user; // Pastikan data user ada dalam decoded token

    // Lanjutkan ke route handler berikutnya
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
