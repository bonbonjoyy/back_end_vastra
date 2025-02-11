//backend/server.js
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3333;

// Middleware untuk mengelola CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "https://vastra-iota.vercel.app",
  "https://vastra-cgrefthq2-rizkys-projects-2394185d.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);


// Middleware untuk parsing JSON
app.use(express.json());

// Middleware untuk melayani file statis (gambar, dll.)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Rute utama aplikasi
app.use(router);

// Rute untuk memastikan server berjalan
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Middleware untuk rute yang tidak ditemukan
app.use((req, res, next) => {
  res.status(404).json({
    message: "Rute yang Anda cari tidak ditemukan. Pastikan URL sudah benar.",
  });
});

// Middleware untuk menangani error secara global
app.use((err, req, res, next) => {
  console.error("Error: ", err.message);
  res.status(err.status || 500).json({
    message: "Terjadi kesalahan pada server.",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});