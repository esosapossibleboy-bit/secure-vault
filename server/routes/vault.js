const express = require('express');
const protect = require('../middleware/auth');
const vaultController = require('../controllers/vaultController');
const router = express.Router();

router.use(protect);
router.get('/', vaultController.getVault);
router.post('/', vaultController.saveVault);
router.delete('/', vaultController.deleteVault);

module.exports = router;