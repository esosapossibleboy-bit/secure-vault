const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // this will store HASH, not plain
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);