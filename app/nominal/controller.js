const Nominal = require('./model');
module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };
      const nominal = await Nominal.find();
      console.log('alert >>');
      console.log(alert);

      res.render('admin/nominal/view_nominal', {
        alert,
        nominal,
        title: 'Halaman Nominal',
      });
    } catch (error) {
      res.status(500).send('Something broke!');
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render('admin/nominal/create', {
        title: 'Halaman Tambah Nominal',
      });
    } catch (error) {
      console.log(error);
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { coinName, coinQuantity, price } = req.body;
      let nominal = await Nominal({ coinName, coinQuantity, price });
      await nominal.save();

      req.flash('alertMessage', 'Berhasil tambah nominal');
      req.flash('alertStatus', 'success');
      res.redirect('/nominal');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/nominal');
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const nominal = await Nominal.findOne({ _id: id });
      console.log(nominal);
      res.render('admin/nominal/edit', {
        title: 'Halaman Edit Nominal',
        nominal,
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/nominal');
      console.log(error);
    }
  },
  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { coinName, coinQuantity, price } = req.body;

      await Nominal.findOneAndUpdate(
        {
          _id: id,
        },
        { coinName, coinQuantity, price }
      );

      req.flash('alertMessage', 'Berhasil ubah nominal');
      req.flash('alertStatus', 'success');

      res.redirect('/nominal');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/nominal');
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;
      await Nominal.findOneAndRemove({
        _id: id,
      });
      req.flash('alertMessage', 'Berhasil hapus nominal');
      req.flash('alertStatus', 'success');

      res.redirect('/nominal');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/nominal');
    }
  },
};
