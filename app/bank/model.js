const mongoose = require("mongoose");

let bankSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: [true, "Nama pemilik harus diisi"],
    },
    nameBank: {
      type: String,
      require: [true, "Nama bank harus diisi"],
    },
    noRekening: {
      type: String,
      require: [true, "Nomor rekening harus diisi"],
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Bank", bankSchema);
