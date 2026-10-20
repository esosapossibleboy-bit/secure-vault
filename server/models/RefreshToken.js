const mongoose = require('mongoose');
const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false }
});
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete
module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);