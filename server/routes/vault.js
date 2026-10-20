const express = require('express');
const auth = require('../middleware/auth'); // you already have this
const validate = require('../middleware/validate');
const { vaultSchema } = require('../middleware/validationSchemas');
const { getVault, saveVault, deleteVault } = require('../controllers/vaultController');

const router = express.Router();

router.use(auth); // Block unauthenticated at border

router.get('/', getVault);
router.post('/', validate(vaultSchema), saveVault);
router.delete('/', deleteVault);

module.exports = router;