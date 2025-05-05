const User = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Obtener un usuario por ID
 * @param {string} userId - ID del usuario a obtener
 * @returns {Object} - Usuario encontrado
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  return user;
};

/**
 * Actualizar datos del perfil del usuario
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} - Usuario actualizado
 */
const updateUserProfile = async (userId, updateData) => {
  // Campos permitidos para actualización
  const allowedFields = ['username', 'personalizationPreferences'];
  
  // Filtrar campos no permitidos
  const filteredData = {};
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });
  
  if (Object.keys(filteredData).length === 0) {
    throw new AppError('No se proporcionaron campos válidos para actualizar', 400);
  }
  
  // Si se actualiza el nombre de usuario, verificar que no esté en uso
  if (filteredData.username) {
    const existingUser = await User.findOne({ 
      username: filteredData.username,
      _id: { $ne: userId } // Excluir el usuario actual
    });
    
    if (existingUser) {
      throw new AppError('Este nombre de usuario ya está en uso', 400);
    }
  }
  
  // Actualizar usuario
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    filteredData,
    {
      new: true, // Devolver el documento actualizado
      runValidators: true // Ejecutar validadores
    }
  );
  
  if (!updatedUser) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  return updatedUser;
};

/**
 * Actualizar preferencias de personalización del usuario
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} preferences - Preferencias a actualizar
 * @returns {Object} - Usuario actualizado
 */
const updateUserPreferences = async (userId, preferences) => {
  if (!preferences || Object.keys(preferences).length === 0) {
    throw new AppError('No se proporcionaron preferencias para actualizar', 400);
  }
  
  // Obtener usuario actual para fusionar preferencias
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  // Fusionar preferencias existentes con las nuevas
  const updatedPreferences = {
    ...user.personalizationPreferences,
    ...preferences
  };
  
  // Actualizar usuario
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { personalizationPreferences: updatedPreferences },
    {
      new: true,
      runValidators: true
    }
  );
  
  return updatedUser;
};

/**
 * Desactivar cuenta de usuario
 * @param {string} userId - ID del usuario a desactivar
 * @returns {Object} - Resultado de operación
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { active: false },
    { new: true }
  );
  
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  // Revocar todos los tokens de actualización
  await user.clearRefreshTokens();
  
  return { success: true, message: 'Cuenta desactivada correctamente' };
};

/**
 * Listar usuarios (solo para administradores)
 * @param {Object} queryParams - Parámetros de consulta (paginación, búsqueda)
 * @returns {Object} - Listado paginado de usuarios
 */
const listUsers = async (queryParams) => {
  // Construir filtro
  const filter = {};
  
  // Búsqueda por nombre de usuario o email
  if (queryParams.search) {
    filter.$or = [
      { username: { $regex: queryParams.search, $options: 'i' } },
      { email: { $regex: queryParams.search, $options: 'i' } }
    ];
  }
  
  // Filtro por rol
  if (queryParams.role) {
    filter.role = queryParams.role;
  }
  
  // Calcular skip para paginación
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const skip = (page - 1) * limit;
  
  // Crear query
  let query = User.find(filter);
  
  // Aplicar ordenación
  if (queryParams.sort) {
    const sortBy = queryParams.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Aplicar selección de campos
  if (queryParams.fields) {
    const fields = queryParams.fields.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Aplicar paginación
  query = query.skip(skip).limit(limit);
  
  // Ejecutar query
  const users = await query;
  
  // Contar total de documentos para paginación
  const total = await User.countDocuments(filter);
  
  return {
    status: 'success',
    results: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: users
  };
};

module.exports = {
  getUserById,
  updateUserProfile,
  updateUserPreferences,
  deactivateUser,
  listUsers
};
 