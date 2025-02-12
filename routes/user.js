// backend/routes/user.js
const express = require("express");
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
} = require("../controller/userController.js");
const authMiddleware = require("../middlewares/authMiddleware");
const { User } = require("../models");
const { Sequelize } = require("sequelize");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/"); // Pastiin folder ini ada
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Support lebih banyak format
        const allowedMimes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif",
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Format file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, HEIC, atau HEIF"
                )
            );
        }
    },
});

const router = express.Router();

router.get("/profile", authMiddleware, async(req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            nama_lengkap: user.nama_lengkap || "",
            profile_image: user.profile_image,
            last_login: user.last_login,
        });
    } catch (error) {
        res.status(500).json({ message: "Error mengambil data profil" });
    }
});

router.patch(
    "/profile/update",
    authMiddleware,
    async(req, res) => {
        try {
            const { nama_lengkap, email, username, profile_image, sandi_saat_ini, kata_sandi } =
            req.body;
            const updates = {};
            const user = await User.findByPk(req.user.id);

            // Verifikasi password lama jika user ingin ganti password
            if (kata_sandi) {
                const isMatch = await bcrypt.compare(sandi_saat_ini, user.kata_sandi);
                if (!isMatch) {
                    return res.status(401).json({
                        message: "Sandi saat ini tidak valid",
                    });
                }
                updates.kata_sandi = await bcrypt.hash(kata_sandi, 10); // Hash kata sandi baru
            }

            // Update field lainnya
            if (nama_lengkap !== undefined) {
                updates.nama_lengkap = nama_lengkap === "" ? null : nama_lengkap;
            }
            if (email) updates.email = email;
            if (username) updates.username = username;
            if (profile_image) updates.profile_image = profile_image;

            // // Update photo jika ada
            // if (req.file) {
            //     updates.profile_image = `/uploads/${req.file.filename}`;
            // }

            await User.update(updates, {
                where: { id: req.user.id },
            });

            const updatedUser = await User.findByPk(req.user.id);
            res.json({
                message: "Profil berhasil diperbarui",
                user: updatedUser,
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({
                message: "Gagal memperbarui profil",
                error: error.message,
            });
        }
    }
);

// Route untuk mendapatkan semua user
router.get("/", getUsers);

// Route untuk mendapatkan user berdasarkan ID (perlu auth)
router.get("/:id", authMiddleware, getUserById);

// Route untuk membuat user baru
router.post("/", upload.single("profile_image"), createUser);

// Route untuk update user (perlu auth)
router.patch(
    "/:id",
    authMiddleware,
    upload.single("profile_image"),
    updateUser
);

// Route untuk delete user (perlu auth)
router.delete("/:id", authMiddleware, deleteUser);

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
    }
    next(err); // If it's another type of error, let express handle it
});

router.put('/forgotpassword', forgotPassword);
router.put('/resetpassword', (req, res) => {
    console.log('Reset password route hit');
    resetPassword(req, res);
  });

module.exports = router;