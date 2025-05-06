const Content = require('../models/contentModel');
const User = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

/**
 * Crea un nuevo contenido
 * @param {Object} contentData - Datos del contenido
 * @param {Object} user - Usuario creador del contenido
 * @returns {Object} - Contenido creado
 */
const createContent = async (contentData, user) => {
  // Crear contenido con el autor actual
  const newContent = await Content.create({
    ...contentData,
    author: user._id
  });

  return newContent;
};

/**
 * Recupera un contenido por ID
 * @param {string} id - ID del contenido
 * @param {Object} user - Usuario que realiza la solicitud
 * @returns {Object} - Contenido encontrado
 */
const getContentById = async (id, user) => {
  const content = await Content.findById(id);

  if (!content) {
    throw new AppError('Contenido no encontrado', 404);
  }

  // Si es contenido personalizado, verificar acceso
  if (content.isPersonalized) {
    // El autor y los admins siempre pueden acceder
    const isAuthor = content.author._id.toString() === user._id.toString();
    if (!isAuthor && user.role !== 'admin') {
      throw new AppError('No tiene permiso para acceder a este contenido', 403);
    }
  }

  return content;
};

/**
 * Actualiza un contenido existente
 * @param {string} id - ID del contenido a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @param {Object} user - Usuario que realiza la actualización
 * @returns {Object} - Contenido actualizado
 */
const updateContent = async (id, updateData, user) => {
  // Buscar contenido
  const content = await Content.findById(id);

  if (!content) {
    throw new AppError('Contenido no encontrado', 404);
  }

  // Verificar permisos (solo el autor o admin pueden actualizar)
  const isAuthor = content.author.toString() === user._id.toString();
  if (!isAuthor && user.role !== 'admin') {
    throw new AppError('No tienes permiso para actualizar este contenido', 403);
  }

  // Si cambia isPersonalized, verificar permisos
  if (updateData.isPersonalized !== undefined && user.role !== 'admin') {
    throw new AppError('No tiene permiso para cambiar la personalización del contenido', 403);
  }

  // Añadir quien actualizó el contenido
  updateData.updatedBy = user._id;

  // Actualizar el contenido
  const updatedContent = await Content.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  return updatedContent;
};

/**
 * Elimina un contenido
 * @param {string} id - ID del contenido a eliminar
 * @param {Object} user - Usuario que realiza la eliminación
 * @returns {Object} - Resultado de la operación
 */
const deleteContent = async (id, user) => {
  // Buscar contenido
  const content = await Content.findById(id);

  if (!content) {
    throw new AppError('Contenido no encontrado', 404);
  }

  // Verificar permisos (solo el autor o admin pueden eliminar)
  const isAuthor = content.author._id.toString() === user._id.toString();
  if (!isAuthor && user.role !== 'admin') {
    throw new AppError('No tiene permiso para eliminar este contenido', 403);
  }

  // Eliminar contenido
  await Content.findByIdAndDelete(id);

  return { success: true };
};

/**
 * Busca y filtra contenido con paginación
 * @param {Object} queryParams - Parámetros de consulta
 * @param {Object} user - Usuario que realiza la consulta
 * @returns {Object} - Resultados paginados
 */
const queryContent = async (queryParams, user) => {
  // Construir filtro
  const filter = {};
  
  // Filtro por estado
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  // Filtro por etiquetas
  if (queryParams.tags && queryParams.tags.length > 0) {
    filter.tags = { $in: queryParams.tags };
  }

  // Búsqueda por texto
  if (queryParams.search) {
    filter.$text = { $search: queryParams.search };
  }

  // Filtro para contenido personalizado
  if (queryParams.personalized === true) {
    filter.$or = [
      { author: user._id },
      { isPersonalized: false }
    ];
  } else {
    // Por defecto, excluir contenido personalizado para otros usuarios
    filter.$or = [
      { isPersonalized: false },
      { author: user._id }
    ];
  }

  // Calcular skip para paginación
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const skip = (page - 1) * limit;

  // Crear query
  let query = Content.find(filter);

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
  const contents = await query;

  // Contar total de documentos para paginación
  const total = await Content.countDocuments(filter);

  return {
    status: 'success',
    results: contents.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: contents
  };
};

/**
 * Obtiene contenido específico para un usuario
 * @param {string} userId - ID del usuario o 'me' para el usuario actual
 * @param {Object} queryParams - Parámetros de consulta
 * @param {Object} currentUser - Usuario que realiza la consulta
 * @returns {Object} - Resultados paginados
 */
const getUserContent = async (userId, queryParams, currentUser) => {
  // Determinar el ID de usuario real
  const targetUserId = userId === 'me' ? currentUser._id : userId;

  // Verificar existencia del usuario
  if (targetUserId !== currentUser._id.toString()) {
    const userExists = await User.exists({ _id: targetUserId });
    if (!userExists) {
      throw new AppError('Usuario no encontrado', 404);
    }
  }

  // Verificar permisos para ver contenido de otro usuario
  if (
    targetUserId !== currentUser._id.toString() && 
    currentUser.role !== 'admin'
  ) {
    throw new AppError('No tiene permiso para ver el contenido de este usuario', 403);
  }

  // Configurar filtro para contenido del usuario
  const filter = {
    author: targetUserId
  };

  // Aplicar filtros adicionales como en queryContent
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.tags && queryParams.tags.length > 0) {
    filter.tags = { $in: queryParams.tags };
  }

  if (queryParams.search) {
    filter.$text = { $search: queryParams.search };
  }

  // Calcular skip para paginación
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const skip = (page - 1) * limit;

  // Crear query
  let query = Content.find(filter);

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
  const contents = await query;

  // Contar total de documentos para paginación
  const total = await Content.countDocuments(filter);

  return {
    status: 'success',
    results: contents.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: contents
  };
};

module.exports = {
  createContent,
  getContentById,
  updateContent,
  deleteContent,
  queryContent,
  getUserContent
}; 