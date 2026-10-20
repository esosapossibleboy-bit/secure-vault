const mongoose = require('mongoose');
const vaultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  blob: String,
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Vault', vaultSchema);