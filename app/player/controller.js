const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");
const Nominal = require("../nominal/model");
const Payment = require("../payment/model");
const Bank = require("../bank/model");
const Transaction = require("../transaction/model");
module.exports = {
  landingPage: async (req, res) => {
    try {
      const voucher = await Voucher.find()
        .select("_id name status category thumbnail")
        .populate("category");
      res.status(200).json({ data: voucher });
    } catch (error) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const voucher = await Voucher.findOne({ _id: id })
        .populate("category")
        .populate("nominals")
        .populate("user", "_id name phoneNumber");

      if (!voucher) {
        return res
          .status(404)
          .json({ message: "voucher game tidak ditemukan" });
      }

      res.status(200).json({ data: voucher });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || `Terjadi kesalahan pada server` });
    }
  },
  category: async (req, res) => {
    try {
      const category = await Category.find();
      res.status(200).json({ data: category });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || `Terjadi kesalahan pada server` });
    }
  },
  checkout: async (req, res) => {
    try {
      const { accountUser, name, nominal, voucher, payment, bank } = req.body;
      const respond_voucher = await Voucher.findOne({ _id: voucher })
        .select("name category _id thumbnail user")
        .populate("category")
        .populate("user");

      if (!respond_voucher)
        return res.status(404).json({ message: "Voucher tidak ditemukan" });

      const respond_nominal = await Nominal.findOne({ _id: nominal });

      if (!respond_nominal)
        return res.status(404).json({ message: "Nominal tidak ditemukan" });

      const respond_payment = await Payment.findOne({ _id: payment });

      if (!respond_payment)
        return res.status(404).json({ message: "Payment tidak ditemukan" });

      const respond_bank = await Bank.findOne({ _id: bank });

      if (!respond_bank)
        return res.status(404).json({ message: "Bank tidak ditemukan" });

      let tax = (10 / 100) * respond_nominal._doc.price;
      let value = respond_nominal._doc.price - tax;

      const payload = {
        historyVoucherTopUp: {
          gameName: respond_voucher._doc.name,
          category: respond_voucher._doc.category
            ? respond_voucher._doc.category.name
            : "",
          thumbnail: respond_voucher._doc.thumbnail,
          coinName: respond_nominal._doc.coinName,
          coinQuantity: respond_nominal._doc.coinQuantity,
          price: respond_nominal._doc.price,
        },
        historyPayment: {
          name: respond_bank._doc.name,
          type: respond_payment._doc.type,
          bankName: respond_bank._doc.bankName,
          noRekening: respond_bank._doc.noRekening,
        },
        name: name,
        accountUser: accountUser,
        tax: tax,
        value: value,
        player: req.player._id,
        historyUser: {
          name: respond_voucher._doc.user?.name, //?.name adalah optional chaining
          phoneNumber: respond_voucher._doc.user?.phoneNumber,
        },
        category: respond_voucher._doc.category?._id,
        user: respond_voucher._doc.user?._id,
      };
      const transaction = new Transaction(payload);

      await transaction.save();

      res.status(201).json({
        data: transaction,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || `Terjadi kesalahan pada server` });
    }
  },
  history: async (req, res) => {
    try {
      const { status = "" } = req.query;
      let criteria = {};

      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      if (req.player._id) {
        criteria = {
          ...criteria,
          player: req.player._id,
        };
      }

      const history = await Transaction.find(criteria);
      let total = await Transaction.aggregate([
        {
          $match: criteria,
        },

        {
          $group: {
            _id: null,
            value: { $sum: "$value" },
          },
        },
      ]);

      res.status(200).json({
        data: history,
        total: total.length ? total[0].value : 0,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
  historyDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const history = await Transaction.findOne({ _id: id });

      if (!history)
        return res.status(404).json({ message: "history tidak ditemukan" });

      res.status(200).json({ data: history });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || `Internal server error` });
    }
  },
  dashboard: async (req, res) => {
    try {
      const count = await Transaction.aggregate([
        { $match: { player: req.player._id } },
        {
          $group: {
            _id: "$category",
            value: { $sum: "$value" },
          },
        },
      ]);
      const category = await Category.find({});
      category.forEach((element) => {
        count.forEach((data) => {
          if (data._id.toString() === element._id.toString()) {
            data.name = element.name;
          }
        });
      });
      const history = await Transaction.find({ player: req.player._id })
        .populate("category")
        .sort({ updateAt: -1 });
      res.status(200).json({ data: history });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || `Internal server error` });
    }
  },
  profile: async (req, res) => {
    try {
      const player = {
        id: req.player._id,
        username: req.player.username,
        email: req.player.email,
        name: req.player.name,
        avatar: req.player.avatar,
        phoneNumber: req.player.phoneNumber,
      };
      res.status(200).json({ data: player });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
};
