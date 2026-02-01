const Joi = require('joi');

// Middleware de validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};

// Schémas de validation

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Mot de passe requis',
  }),
  fullName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Nom complet requis',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createOrderSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  companyType: Joi.string().required(),
  googleMapsLink: Joi.string().uri().required(),
  quantity: Joi.number().valid(10, 20, 30, 40, 50).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createOrderSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
};
