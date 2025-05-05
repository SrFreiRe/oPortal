const { AppError } = require('./errorHandler');

/**
 * Middleware para validar datos de entrada con esquemas Zod
 * @param {Object} schema - Esquema Zod para validar datos
 * @param {string} source - Fuente de datos a validar ('body', 'params', 'query')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Reemplazar los datos originales con los datos validados
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));

        return next(
          new AppError(`Error de validación: ${formattedErrors[0].message}`, 400)
        );
      }
      
      next(new AppError('Error de validación de datos', 400));
    }
  };
};

module.exports = {
  validate
}; 