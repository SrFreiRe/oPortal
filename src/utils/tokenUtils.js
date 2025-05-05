const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} secret - Clave secreta para firmar
 * @param {string|number} expiresIn - Tiempo de expiración
 * @returns {string} - Token JWT
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Genera tokens de acceso y actualización para un usuario
 * @param {Object} user - Usuario para el que se generan los tokens
 * @returns {Object} - Objeto con ambos tokens y sus configuraciones
 */
const generateAuthTokens = (user) => {
  // Token de acceso - corta duración
  const accessToken = generateToken(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    process.env.JWT_ACCESS_EXPIRE || '15m'
  );

  // Token de actualización - larga duración
  const refreshToken = generateToken(
    { id: user._id },
    process.env.JWT_SECRET,
    process.env.JWT_REFRESH_EXPIRE || '7d'
  );

  // Calcular tiempos de expiración para cookies
  const accessTokenExpiry = new Date(
    Date.now() + parseInt(process.env.JWT_ACCESS_EXPIRE || '15m') * 60 * 1000
  );
  
  const refreshTokenExpiry = new Date(
    Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRE || '7d') * 24 * 60 * 60 * 1000
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry
  };
};

/**
 * Configura cookies seguras para los tokens
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} accessToken - Token de acceso
 * @param {string} refreshToken - Token de actualización
 * @param {Date} accessTokenExpiry - Fecha de expiración del token de acceso
 * @param {Date} refreshTokenExpiry - Fecha de expiración del token de actualización
 */
const setTokenCookies = (
  res,
  accessToken,
  refreshToken,
  accessTokenExpiry,
  refreshTokenExpiry
) => {
  // Configuración común para cookies seguras
  const cookieOptions = {
    httpOnly: true, // No accesible por JavaScript
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'strict', // Protección contra CSRF
  };

  // Configurar cookie para token de acceso
  res.cookie('jwt', accessToken, {
    ...cookieOptions,
    expires: accessTokenExpiry
  });

  // Configurar cookie para token de actualización
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: refreshTokenExpiry,
    path: '/api/v1/auth/refresh' // Solo accesible en esta ruta
  });
};

/**
 * Limpia las cookies de token
 * @param {Object} res - Objeto de respuesta Express
 */
const clearTokenCookies = (res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/api/v1/auth/refresh'
  });
};

module.exports = {
  generateToken,
  generateAuthTokens,
  setTokenCookies,
  clearTokenCookies
}; 