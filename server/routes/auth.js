const express = require('express');
const { registerRules, loginRules, validate } = require('../middleware/validate');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;