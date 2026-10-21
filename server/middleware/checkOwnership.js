const Vault = require('../models/Vault');
exports.checkVaultOwner = async (req, res, next) => {
  const vault = await Vault.findById(req.params.id);
  if (!vault) return res.status(404).json({message:'Vault not found'});
  if (vault.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({message:'BOLA blocked'});
  req.vault = vault; next();
};