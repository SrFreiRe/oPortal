const express = require('express');
const contentController = require('../controllers/contentController');
const { validate } = require('../middleware/validateMiddleware');
const { 
  createContentSchema, 
  updateContentSchema,
  contentQuerySchema,
  idParamSchema
} = require('../schemas/contentSchemas');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de contenido requieren autenticación
router.use(protect);

// Rutas para contenido del usuario actual
router.get('/me', validate(contentQuerySchema, 'query'), contentController.getMyContent);

// Rutas para operaciones CRUD de contenido
router
  .route('/')
  .get(validate(contentQuerySchema, 'query'), contentController.getAllContent)
  .post(validate(createContentSchema), contentController.createContent);

router
  .route('/:id')
  .get(validate(idParamSchema, 'params'), contentController.getContent)
  .patch(
    validate(idParamSchema, 'params'),
    validate(updateContentSchema),
    contentController.updateContent
  )
  .delete(
    validate(idParamSchema, 'params'),
    contentController.deleteContent
  );

// Rutas para contenido de un usuario específico
// Solo administradores pueden acceder a contenido de otros usuarios
router.get(
  '/user/:userId',
  validate(contentQuerySchema, 'query'),
  contentController.getUserContent
);

module.exports = router; 