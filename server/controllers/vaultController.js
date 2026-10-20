const Vault = require('../models/Vault');

exports.getVault = async (req,res)=>{
  const vault = await Vault.findOne({ userId: req.userId });
  res.json(vault || { blob: null });
};

exports.saveVault = async (req,res)=>{
  const { blob } = req.body;
  if(!blob) return res.status(400).json({ error: 'Blob required' });
  const vault = await Vault.findOneAndUpdate(
    { userId: req.userId },
    { userId: req.userId, blob },
    { upsert: true, new: true, runValidators: true }
  );
  res.json(vault);
};

exports.deleteVault = async (req,res)=>{
  await Vault.deleteOne({ userId: req.userId });
  res.json({ message: 'Vault cleared' });
};