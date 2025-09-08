const config = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Player = require("../player/model");

module.exports = {
  isLoginAdmin: (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash(
        "alertMessage",
        "Mohon maaf session Login Anda telah berakhir, silahkan Login kembali!"
      );
      req.flash("alertStatus", "danger");
      res.redirect("/");
    } else {
      next();
    }
  },
 isLoginPlayer: async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : null;

    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    const data = jwt.verify(token, config.jwtKey);

    // LOG UNTUK DEBUGGING:
    console.log("Token yang berhasil diverifikasi:", data);
    
    // Sesuaikan dengan struktur payload token Anda.
    // Asumsi: payload token adalah { id: "id-pemain-di-database" }
    const playerId = data.id || data.player.id;

    const player = await Player.findOne({ _id: playerId });

    if (!player) {
      throw new Error('Pemain tidak ditemukan');
    }

    req.player = player;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message || 'Tidak diotorisasi untuk mengakses sumber daya ini' });
  }
},
};
