const contentService = require('../services/contentService');

/**
 * Crear nuevo contenido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const createContent = async (req, res, next) => {
  try {
    // Los datos ya están validados por el middleware de Zod
    const newContent = await contentService.createContent(req.body, req.user);
    
    res.status(201).json({
      status: 'success',
      data: {
        content: newContent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contenido por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getContent = async (req, res, next) => {
  try {
    const content = await contentService.getContentById(req.params.id, req.user);
    
    res.status(200).json({
      status: 'success',
      data: {
        content
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar contenido existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const updateContent = async (req, res, next) => {
  try {
    const updatedContent = await contentService.updateContent(
      req.params.id,
      req.body,
      req.user
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        content: updatedContent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar contenido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const deleteContent = async (req, res, next) => {
  try {
    await contentService.deleteContent(req.params.id, req.user);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener lista de contenido con filtros y paginación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getAllContent = async (req, res, next) => {
  try {
    // Los parámetros de consulta ya están validados por el middleware de Zod
    const result = await contentService.queryContent(req.query, req.user);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contenido de un usuario específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getUserContent = async (req, res, next) => {
  try {
    // Los parámetros de consulta ya están validados por el middleware de Zod
    const result = await contentService.getUserContent(
      req.params.userId,
      req.query,
      req.user
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contenido del usuario actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getMyContent = async (req, res, next) => {
  try {
    // Usar el ID del usuario autenticado
    req.params.userId = 'me';
    
    // Los parámetros de consulta ya están validados por el middleware de Zod
    const result = await contentService.getUserContent(
      req.params.userId,
      req.query,
      req.user
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContent,
  getContent,
  updateContent,
  deleteContent,
  getAllContent,
  getUserContent,
  getMyContent
}; 