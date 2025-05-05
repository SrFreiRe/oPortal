const User = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');
const { 
  generateAuthTokens, 
  setTokenCookies,
  clearTokenCookies
} = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const logger = require('../utils/logger');

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario para registro
 * @returns {Object} - Usuario creado y tokens
 */
const registerUser = async (userData) => {
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ 
    $or: [
      { email: userData.email },
      { username: userData.username }
    ]
  });

  if (existingUser) {
    if (existingUser.email === userData.email) {
      throw new AppError('Este correo electrónico ya está registrado', 400);
    } else {
      throw new AppError('Este nombre de usuario ya está en uso', 400);
    }
  }

  // Crear nuevo usuario
  const newUser = await User.create({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'user'
  });

  // Generar tokens
  const tokens = generateAuthTokens(newUser);

  // Guardar token de actualización en la base de datos
  await newUser.addRefreshToken(tokens.refreshToken);

  // No incluir la contraseña en la respuesta
  newUser.password = undefined;

  return {
    user: newUser,
    ...tokens
  };
};

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} - Usuario y tokens
 */
const loginUser = async (email, password) => {
  // Buscar usuario por email y seleccionar explícitamente el campo password
  const user = await User.findOne({ email }).select('+password');

  // Verificar si el usuario existe y la contraseña es correcta
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }

  // Generar tokens
  const tokens = generateAuthTokens(user);

  // Guardar token de actualización en la base de datos
  await user.addRefreshToken(tokens.refreshToken);

  // No incluir la contraseña en la respuesta
  user.password = undefined;

  return {
    user,
    ...tokens
  };
};

/**
 * Cierra la sesión de un usuario
 * @param {string} refreshToken - Token de actualización a invalidar
 * @param {Object} user - Usuario actual
 * @returns {boolean} - Resultado de operación
 */
const logoutUser = async (refreshToken, user) => {
  if (refreshToken) {
    // Eliminar el token de actualización específico
    await user.removeRefreshToken(refreshToken);
  } else {
    // Si no se proporciona un token específico, eliminar todos los tokens
    await user.clearRefreshTokens();
  }

  return true;
};

/**
 * Actualiza el token de acceso usando un token de actualización
 * @param {string} refreshToken - Token de actualización
 * @returns {Object} - Nuevos tokens
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('No se proporcionó token de actualización', 401);
  }

  try {
    // Verificar token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_SECRET
    );

    // Buscar usuario y verificar si el token está en su lista
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('El usuario ya no existe', 401);
    }

    // Verificar si el token está en la lista de tokens válidos
    if (!user.refreshTokens.includes(refreshToken)) {
      // Posible reutilización de token, invalidar todos los tokens
      await user.clearRefreshTokens();
      throw new AppError('Token inválido o ya utilizado, por favor inicie sesión nuevamente', 401);
    }

    // Eliminar el token anterior y generar nuevos tokens
    await user.removeRefreshToken(refreshToken);
    const tokens = generateAuthTokens(user);

    // Guardar el nuevo token de actualización
    await user.addRefreshToken(tokens.refreshToken);

    return tokens;
  } catch (error) {
    if (error instanceof AppError) throw error;
    
    logger.error(`Error al refrescar token: ${error.message}`);
    throw new AppError('No autorizado. Por favor inicie sesión nuevamente.', 401);
  }
};

/**
 * Actualiza la contraseña de un usuario
 * @param {Object} user - Usuario actual
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Object} - Usuario actualizado y nuevos tokens
 */
const updatePassword = async (user, currentPassword, newPassword) => {
  // Obtener usuario con contraseña
  const currentUser = await User.findById(user._id).select('+password');

  // Verificar contraseña actual
  if (!(await currentUser.correctPassword(currentPassword, currentUser.password))) {
    throw new AppError('La contraseña actual es incorrecta', 401);
  }

  // Actualizar contraseña
  currentUser.password = newPassword;
  await currentUser.save();

  // Invalidar todos los tokens de actualización existentes
  await currentUser.clearRefreshTokens();

  // Generar nuevos tokens
  const tokens = generateAuthTokens(currentUser);

  // Guardar nuevo token de actualización
  await currentUser.addRefreshToken(tokens.refreshToken);

  // No incluir la contraseña en la respuesta
  currentUser.password = undefined;

  return {
    user: currentUser,
    ...tokens
  };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword
}; 