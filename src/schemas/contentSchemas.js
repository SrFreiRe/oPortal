const { z } = require('zod');

// Esquema base para contenido
const contentBaseSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede tener más de 100 caracteres')
    .trim(),
  
  body: z
    .string()
    .min(1, 'El cuerpo del contenido es requerido')
    .trim(),
  
  isPersonalized: z
    .boolean()
    .optional()
    .default(false),
  
  associatedUsers: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario inválido'))
    .optional()
    .default([]),
  
  status: z
    .enum(['draft', 'published', 'archived'])
    .optional()
    .default('draft'),
  
  tags: z
    .array(z.string())
    .optional()
    .default([]),
  
  metadata: z
    .record(z.any())
    .optional()
    .default({})
});

// Esquema para crear contenido nuevo
const createContentSchema = contentBaseSchema;

// Esquema para actualizar contenido (todos los campos son opcionales)
const updateContentSchema = contentBaseSchema.partial().extend({
  updatedBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario inválido')
    .optional()
});

// Esquema para parámetros de filtro en consultas de contenido
const contentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .refine(val => val > 0, {
      message: 'La página debe ser un número mayor que 0'
    }),
  
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .refine(val => val > 0 && val <= 100, {
      message: 'El límite debe ser un número entre 1 y 100'
    }),
  
  sort: z
    .string()
    .optional()
    .default('-createdAt'),
  
  fields: z
    .string()
    .optional(),
  
  personalized: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',') : [])),
  
  status: z
    .string()
    .optional()
    .transform(val => (val && ['draft', 'published', 'archived'].includes(val) ? val : undefined)),
  
  search: z
    .string()
    .optional()
});

// Esquema para parámetros de ID en solicitudes
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido')
});

module.exports = {
  createContentSchema,
  updateContentSchema,
  contentQuerySchema,
  idParamSchema
}; 