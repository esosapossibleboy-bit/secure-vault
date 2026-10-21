const Vault = require('../models/Vault');

exports.createVault = async (req,res)=>{
  try{
    const vault = await Vault.create({ name: req.body.name, owner: req.user._id });
    res.status(201).json(vault);
  }catch(e){ res.status(400).json({message:e.message}); }
};

exports.getMyVaults = async (req,res)=>{
  const vaults = await Vault.find({ owner: req.user._id });
  res.json(vaults);
};

exports.getVault = async (req,res)=>{ res.json(req.vault); };

exports.updateVault = async (req,res)=>{
  req.vault.name = req.body.name || req.vault.name;
  await req.vault.save();
  res.json(req.vault);
};

exports.deleteVault = async (req,res)=>{
  await req.vault.deleteOne();
  res.json({message:'Deleted'});
};

exports.getAllVaults = async (req,res)=>{
  const vaults = await Vault.find();
  res.json(vaults);
};