const Category = require('./model');
module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };
      const category = await Category.find();

      console.log('alert >>');
      console.log(alert);

      res.render('admin/category/view_category', {
        category,
        alert,

        title: 'Halaman Kategori',
      });
    } catch (error) {
      res.status(500).send('Something broke!');
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render('admin/category/create', {
        title: 'Halaman Tambah Kategori',
      });
    } catch (error) {
      console.log(error);
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name } = req.body;
      let category = await Category({ name });
      await category.save();

      req.flash('alertMessage', 'Berhasil tambah kategori');
      req.flash('alertStatus', 'success');
      res.redirect('/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/category');
    }
  },
};
