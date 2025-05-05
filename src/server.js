require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Variables de entorno
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB();

// Iniciar el servidor
const server = app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error(`Error no manejado: ${err.message}`);
  // Cerrar el servidor y salir del proceso
  server.close(() => process.exit(1));
});

// Manejo de señales SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando el servidor...');
  server.close(() => {
    logger.info('Proceso terminado');
  });
});

module.exports = server; 