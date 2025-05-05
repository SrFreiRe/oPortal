const { AppError } = require('./errorHandler');

/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor`, 404));
};

module.exports = {
  notFound
}; 