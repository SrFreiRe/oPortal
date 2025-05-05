const authService = require('../services/authService');
const { setTokenCookies, clearTokenCookies } = require('../utils/tokenUtils');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controlador para registrar un nuevo usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const register = async (req, res, next) => {
  try {
    // Los datos ya están validados por el middleware de Zod
    const result = await authService.registerUser(req.body);
    
    // Configurar cookies para tokens
    setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.accessTokenExpiry,
      result.refreshTokenExpiry
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para iniciar sesión
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Iniciar sesión con el servicio de autenticación
    const result = await authService.loginUser(email, password);
    
    // Configurar cookies para tokens
    setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.accessTokenExpiry,
      result.refreshTokenExpiry
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para cerrar sesión
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const logout = async (req, res, next) => {
  try {
    // Obtener el token de actualización de la cookie
    const refreshToken = req.cookies.refreshToken;
    
    // Cerrar sesión con el servicio de autenticación
    await authService.logoutUser(refreshToken, req.user);
    
    // Limpiar cookies de token
    clearTokenCookies(res);
    
    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para actualizar el token de acceso
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const refreshToken = async (req, res, next) => {
  try {
    // Obtener el token de actualización de la cookie o del cuerpo
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return next(new AppError('No se proporcionó token de actualización', 401));
    }
    
    // Actualizar token con el servicio de autenticación
    const tokens = await authService.refreshAccessToken(refreshToken);
    
    // Configurar cookies para nuevos tokens
    setTokenCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.accessTokenExpiry,
      tokens.refreshTokenExpiry
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para actualizar la contraseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Actualizar contraseña con el servicio de autenticación
    const result = await authService.updatePassword(
      req.user,
      currentPassword,
      newPassword
    );
    
    // Configurar cookies para nuevos tokens
    setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.accessTokenExpiry,
      result.refreshTokenExpiry
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener usuario actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  updatePassword,
  getMe
}; 