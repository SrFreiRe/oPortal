const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Proteger todas las rutas de usuario
router.use(protect);

// Rutas para el usuario actual
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/preferences', userController.updatePreferences);
router.delete('/me', userController.deleteMe);

// Rutas de administrador
router.use(restrictTo('admin')); // Solo los administradores pueden acceder a las siguientes rutas

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);

module.exports = router; 