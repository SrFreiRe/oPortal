const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Por favor ingrese un nombre de usuario'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
      maxlength: [20, 'El nombre de usuario no puede tener más de 20 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Por favor ingrese un correo electrónico'],
      unique: true,
      lowercase: true,
      trim: true,
      // Validación básica de correo electrónico
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Por favor ingrese un correo electrónico válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'Por favor ingrese una contraseña'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No incluir en las consultas por defecto
    },
    role: {
      type: String,
      enum: ['user', 'editor', 'admin'],
      default: 'user',
    },
    personalizationPreferences: {
      type: Object,
      default: {},
    },
    refreshTokens: [String], // Almacenar múltiples tokens de refresco
    passwordChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true, // Añadir createdAt y updatedAt automáticamente
  }
);

// Middleware para cifrar contraseña antes de guardar
userSchema.pre('save', async function (next) {
  // Solo ejecutar si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  // Cifrar la contraseña con un costo de 12
  this.password = await bcrypt.hash(this.password, 12);

  // Actualizar la fecha de cambio de contraseña
  this.passwordChangedAt = Date.now() - 1000; // Restar 1 segundo para manejar posibles retrasos

  next();
});

// Middleware para excluir usuarios desactivados
userSchema.pre(/^find/, function (next) {
  // this apunta al query actual
  this.find({ active: { $ne: false } });
  next();
});

// Método para verificar si la contraseña es correcta
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Método para verificar si el usuario cambió su contraseña después de la emisión del token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // Falso significa que NO cambió
  return false;
};

// Método para añadir un nuevo token de actualización
userSchema.methods.addRefreshToken = async function (token) {
  // Limitar la cantidad de tokens almacenados (máximo 5 por usuario)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Eliminar el token más antiguo
  }
  
  this.refreshTokens.push(token);
  return this.save({ validateBeforeSave: false });
};

// Método para eliminar un token de actualización
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(t => t !== token);
  return this.save({ validateBeforeSave: false });
};

// Método para revocar todos los tokens de actualización
userSchema.methods.clearRefreshTokens = async function () {
  this.refreshTokens = [];
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 