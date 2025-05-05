const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');
const { 
  registerSchema, 
  loginSchema, 
  updatePasswordSchema,
  refreshTokenSchema
} = require('../schemas/authSchemas');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Rutas protegidas (requieren autenticación)
router.use(protect); // Middleware de protección para todas las rutas a continuación

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.patch('/update-password', validate(updatePasswordSchema), authController.updatePassword);

module.exports = router; 