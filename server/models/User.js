const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  twoFactorSecret: String,
  is2FAEnabled: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);