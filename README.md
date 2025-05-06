# oPortal API: RESTful Moderna y Escalable

API RESTful moderna para autenticación y gestión de contenido personalizado, desarrollada con Node.js, Express y MongoDB.

## Características

- **Arquitectura en Capas**: Separación clara de responsabilidades (rutas, controladores, servicios, modelos)
- **Autenticación Robusta**: Sistema JWT con rotación de tokens de actualización
- **Gestión de Contenido**: Operaciones CRUD completas con soporte para contenido personalizado
- **Validación de Entrada**: Esquemas Zod para validar todas las entradas
- **Seguridad**: Implementación de mejores prácticas de seguridad (CORS, Helmet, sanitización)
- **Manejo de Errores**: Sistema robusto y consistente de manejo de errores
- **Logging**: Registro estructurado para facilitar la depuración

## Requisitos

- Node.js v14+
- MongoDB v4+

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <repositorio>
   cd oportal
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno (crear archivo `.env`):
   ```
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/oportal
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   COOKIE_SECRET=your_cookie_secret_key_change_in_production
   ```

4. Iniciar el servidor:
   - Para desarrollo:
     ```bash
     npm run dev
     ```
   - Para producción:
     ```bash
     npm start
     ```

## Estructura del Proyecto

```
/src
  /config        # Configuraciones (base de datos, etc.)
  /controllers   # Controladores de ruta
  /middleware    # Middleware (auth, validación, errores)
  /models        # Modelos de datos Mongoose
  /routes        # Definiciones de rutas
  /schemas       # Esquemas de validación Zod
  /services      # Lógica de negocio
  /utils         # Utilidades (tokens, logger, etc.)
  app.js         # Configuración de Express
  server.js      # Punto de entrada
```

## Puntos Finales de la API

### Autenticación

- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión (requiere autenticación)
- `POST /api/v1/auth/refresh` - Actualizar token de acceso
- `PATCH /api/v1/auth/update-password` - Actualizar contraseña (requiere autenticación)
- `GET /api/v1/auth/me` - Obtener usuario actual (requiere autenticación)

### Gestión de Contenido

- `GET /api/v1/content` - Obtener lista de contenido (con filtros)
- `POST /api/v1/content` - Crear nuevo contenido
- `GET /api/v1/content/:id` - Obtener contenido por ID
- `PATCH /api/v1/content/:id` - Actualizar contenido
- `DELETE /api/v1/content/:id` - Eliminar contenido
- `GET /api/v1/content/me` - Obtener contenido del usuario actual
- `GET /api/v1/content/user/:userId` - Obtener contenido de un usuario específico

### Endpoints de Usuario

- `GET /api/v1/users/me` - Obtener perfil del usuario actual
- `PATCH /api/v1/users/me` - Actualizar perfil del usuario actual
- `DELETE /api/v1/users/me` - Desactivar cuenta del usuario actual

### Endpoints de Administrador

- `GET /api/v1/users` - Listar todos los usuarios
- `GET /api/v1/users/:id` - Obtener un usuario específico
- `PATCH /api/v1/users/:id` - Actualizar un usuario específico
- `DELETE /api/v1/users/:id` - Desactivar un usuario específico

## Seguridad

La API implementa las siguientes medidas de seguridad:

- **Protección CORS**: Configurado para aceptar solicitudes solo de orígenes permitidos
- **Headers de Seguridad**: Implementación con Helmet
- **Autenticación JWT**: Tokens de acceso de corta duración (15 minutos) y tokens de actualización de larga duración (7 días)
- **Rotación de Tokens**: Implementación de rotación de tokens de actualización
- **HTTP-Only Cookies**: Tokens almacenados en cookies HTTP-only
- **Sanitización de Entradas**: Prevención de inyecciones NoSQL
- **Limitación de Velocidad**: Protección contra ataques de fuerza bruta
- **Validación de Datos**: Validación estricta con Zod

## Personalización de Contenido

La API permite:

- Crear contenido general o personalizado para usuarios específicos
- Filtrar contenido basado en preferencias del usuario
- Gestionar y actualizar preferencias de usuario
- Acceder a contenido personalizado específicamente para cada usuario

## Documentación Adicional

Para más detalles sobre la implementación y uso de la API, consultar la documentación en línea o contactar al equipo de desarrollo.

## Licencia

[MIT](LICENSE) 