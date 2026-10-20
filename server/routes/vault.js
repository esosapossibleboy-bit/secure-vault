const express = require('express');
const Vault = require('../models/Vault');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req,res)=>{
  const v = await Vault.findOne({ userId: req.userId });
  res.json({ blob: v?.blob || null });
});

router.post('/', auth, async (req,res)=>{
  const { blob } = req.body;
  const v = await Vault.findOneAndUpdate(
    { userId: req.userId },
    { blob, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json({ success: true });
});

module.exports = router;