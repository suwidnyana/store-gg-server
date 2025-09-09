const mongoose = require('mongoose');
const { urlDb } = require('../config');

mongoose.set('strictQuery', false);

async function connectDB() {
  try {
    await mongoose.connect(urlDb);
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1); // exit kalau gagal connect
  }
}

connectDB();

module.exports = mongoose.connection;
