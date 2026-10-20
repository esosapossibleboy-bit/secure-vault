const { body, validationResult } = require('express-validator');

exports.registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars')
    .matches(/[A-Z]/).withMessage('Need uppercase')
    .matches(/[0-9]/).withMessage('Need number')
    .matches(/[^A-Za-z0-9]/).withMessage('Need special char'),
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

exports.validate = (req,res,next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};