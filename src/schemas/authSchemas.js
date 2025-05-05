const { z } = require('zod');

// Esquema base para usuario
const userBaseSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  email: z
    .string()
    .email('Por favor ingrese un correo electrónico válido')
    .toLowerCase(),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
    )
});

// Esquema para registrar usuario
const registerSchema = userBaseSchema.extend({
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm']
});

// Esquema para iniciar sesión
const loginSchema = z.object({
  email: z.string().email('Por favor ingrese un correo electrónico válido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Esquema para actualizar contraseña
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
    ),
  newPasswordConfirm: z.string()
}).refine((data) => data.newPassword === data.newPasswordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['newPasswordConfirm']
});

// Esquema para restablecer contraseña (solicitud)
const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor ingrese un correo electrónico válido').toLowerCase()
});

// Esquema para restablecer contraseña (reinicio)
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
    ),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm']
});

// Esquema para actualizar token de refresco
const refreshTokenSchema = z.object({
  refreshToken: z.string().optional()
  // El token de refresco puede venir en una cookie, así que lo hacemos opcional en el cuerpo
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
}; 