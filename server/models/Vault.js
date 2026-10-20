const mongoose = require('mongoose');

const VaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  blob: {
    type: String,
    required: true,
    maxlength: 100000
  }
}, { timestamps: true, strict: true });

module.exports = mongoose.model('Vault', VaultSchema);