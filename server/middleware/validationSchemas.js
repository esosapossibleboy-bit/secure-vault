const Joi = require('joi');

exports.registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.vaultSchema = Joi.object({
  blob: Joi.string().required().min(1).max(100000).messages({
    'any.required': 'blob is required'
  })
});