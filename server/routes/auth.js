const express = require('express');
const { register, login, refresh, logout, me, logoutAll } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/validationSchemas');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, me);
router.post('/logout-all', auth, logoutAll);

module.exports = router;