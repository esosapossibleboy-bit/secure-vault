const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title max 100 chars'],
    minlength: [1, 'Title required']
  },
  blob: {
    type: String,
    maxlength: [50000, 'Blob too large']
  }
}, { timestamps: true, strict: true });

module.exports = mongoose.model('VaultItem', VaultItemSchema);