const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const { AppError } = require('./errorHandler');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
const protect = async (req, res, next) => {
  try {
    // 1) Obtener token y verificar si existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('No ha iniciado sesión. Por favor inicie sesión para obtener acceso.', 401)
      );
    }

    // 2) Verificar token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('El usuario perteneciente a este token ya no existe.', 401)
      );
    }

    // 4) Verificar si el usuario cambió la contraseña después de que se emitió el token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('El usuario cambió recientemente su contraseña. Por favor inicie sesión nuevamente.', 401)
      );
    }

    // Conceder acceso a la ruta protegida
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('No autorizado. Por favor inicie sesión nuevamente.', 401));
  }
};

/**
 * Middleware para restringir el acceso a rutas según los roles de usuario
 * @param  {...string} roles - Roles permitidos
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles es un array, por ejemplo: ['admin', 'editor']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tiene permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
}; 