const { body, validationResult } = require('express-validator');

exports.registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 })
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};