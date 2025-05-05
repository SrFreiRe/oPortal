const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Un contenido debe tener un título'],
      trim: true,
      maxlength: [100, 'El título no puede tener más de 100 caracteres']
    },
    body: {
      type: String,
      required: [true, 'Un contenido debe tener un cuerpo'],
      trim: true
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Un contenido debe tener un autor']
    },
    isPersonalized: {
      type: Boolean,
      default: false
    },
    associatedUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    metadata: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    tags: [String],
    // Campos adicionales para implementar versionado básico
    version: {
      type: Number,
      default: 1
    },
    previousVersions: [
      {
        title: String,
        body: String,
        updatedAt: Date,
        updatedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      }
    ]
  },
  {
    timestamps: true,
    // Definir índices para consultas comunes
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para mejorar el rendimiento de las consultas
contentSchema.index({ author: 1, createdAt: -1 });
contentSchema.index({ associatedUsers: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ title: 'text', body: 'text' });

// Middleware para poblar automáticamente el autor en las consultas
contentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'username'
  });
  next();
});

// Middleware para crear una nueva versión antes de actualizar
contentSchema.pre('findOneAndUpdate', async function(next) {
  // Obtener el documento antes de actualizarlo
  const docToUpdate = await this.model.findOne(this.getQuery());
  
  if (!docToUpdate) return next();

  // Extraer los datos actualizados del body
  const update = this.getUpdate();
  const updatedTitle = update.title || update.$set?.title;
  const updatedBody = update.body || update.$set?.body;
  
  // Solo crear una nueva versión si el título o el cuerpo cambian
  if (updatedTitle || updatedBody) {
    const newVersion = {
      title: docToUpdate.title,
      body: docToUpdate.body,
      updatedAt: new Date(),
      updatedBy: update.updatedBy || update.$set?.updatedBy
    };
    
    // Actualizar con la nueva versión y aumentar el número de versión
    this.set({
      previousVersions: [...docToUpdate.previousVersions, newVersion],
      version: docToUpdate.version + 1
    });
  }
  
  next();
});

// Virtual para contenido personalizado
contentSchema.virtual('isPersonalizedFor', {
  ref: 'User',
  localField: 'associatedUsers',
  foreignField: '_id',
  justOne: false
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 