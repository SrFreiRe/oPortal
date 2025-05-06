const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Obtener perfil del usuario actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

/**
 * Actualizar perfil del usuario actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const updateMe = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desactivar cuenta del usuario actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const deactivateMe = async (req, res, next) => {
  try {
    await userService.deactivateUser(req.user._id);
    
    res.status(200).json({
      status: 'success',
      message: 'Cuenta desactivada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los usuarios (solo admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.query);
    
    res.status(200).json({
      status: 'success',
      ...users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un usuario específico (solo admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un usuario específico (solo admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desactivar un usuario específico (solo admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const deactivateUser = async (req, res, next) => {
  try {
    await userService.deactivateUser(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario desactivado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  deactivateMe,
  getAllUsers,
  getUser,
  updateUser,
  deactivateUser
}; 