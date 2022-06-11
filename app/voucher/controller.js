const Voucher = require('./model');
const Category = require('../category/model');
const Nominal = require('./../nominal/model');
const path = require('path')
const fs = require('fs')
const config = require('../../config')
module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');

      const alert = { message: alertMessage, status: alertStatus };
      const voucher = await Voucher.find()
      .populate('category')
      .populate('nominals')
      console.log('alert >>');
      console.log(voucher);

      res.render('admin/voucher/view_voucher', {
        alert,
        voucher,
        title: 'Halaman Voucher',
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Something broke!');
    }
  },
  viewCreate: async (req, res) => {
    try {
      const category = await Category.find();
      const nominal = await Nominal.find();
      res.render('admin/voucher/create', {
        title: 'Halaman Tambah Voucher',
        category,
        nominal,
      });
    } catch (error) {
      console.log(error);
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/voucher')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, category, nominals } = req.body

      if(req.file){
        let tmp_path= req.file.path;
        let originaExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originaExt;
        let target_path = path.resolve(config.rootPath, `public/uploads/${filename}`)

        const src = fs.createReadStream(tmp_path)
        const dest = fs.createWriteStream(target_path)

        src.pipe(dest)

        src.on('end', async ()=>{
          try {

            const voucher = new Voucher({
              name,
              category,
              nominals,
              thumbnial: filename
            })

            await voucher.save();

            req.flash('alertMessage', "Berhasil tambah voucher")
            req.flash('alertStatus', "success")
      
            res.redirect('/voucher')
            
          } catch (err) {
            req.flash('alertMessage', `${err.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/voucher')
          }
        })
      }else{
        const voucher = new Voucher({
          name,
          category,
          nominals,
        })

        await voucher.save();

        req.flash('alertMessage', "Berhasil tambah voucher")
        req.flash('alertStatus', "success")
  
        res.redirect('/voucher')
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/nominal')
    }
  },
  //   viewEdit: async (req, res) => {
  //     try {
  //       const { id } = req.params;
  //       const nominal = await Nominal.findOne({ _id: id });
  //       console.log(nominal);
  //       res.render('admin/nominal/edit', {
  //         title: 'Halaman Edit Nominal',
  //         nominal,
  //       });
  //     } catch (error) {
  //       req.flash('alertMessage', `${error.message}`);
  //       req.flash('alertStatus', 'danger');
  //       res.redirect('/nominal');
  //       console.log(error);
  //     }
  //   },
  //   actionEdit: async (req, res) => {
  //     try {
  //       const { id } = req.params;
  //       const { coinName, coinQuantity, price } = req.body;

  //       await Nominal.findOneAndUpdate(
  //         {
  //           _id: id,
  //         },
  //         { coinName, coinQuantity, price }
  //       );

  //       req.flash('alertMessage', 'Berhasil ubah nominal');
  //       req.flash('alertStatus', 'success');

  //       res.redirect('/nominal');
  //     } catch (err) {
  //       req.flash('alertMessage', `${err.message}`);
  //       req.flash('alertStatus', 'danger');
  //       res.redirect('/nominal');
  //     }
  //   },
  actionDelete: async(req, res) => {
    try {
        const { id } = req.params

        const voucher = await Voucher.findOneAndRemove({
            _id: id
        });

        let currentImage = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;
        if(fs.existsSync(currentImage)){
            fs.unlinkSync(currentImage)
        }


        req.flash('alertMessage', "Berhasil hapus voucher")
        req.flash('alertStatus', "success")

        res.redirect('/voucher')

    } catch (err) {
        req.flash('alertMessage', `${err.message}`)
        req.flash('alertStatus', 'danger')
        res.redirect('/voucher')
    }
},
};
