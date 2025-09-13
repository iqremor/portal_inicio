# Portal de Evaluación Académica IEM - Documentación Técnica

## Información General

**Nombre del Proyecto:** Portal de Evaluación Académica IEM  
**Versión:** 1.0.0  
**Fecha de Creación:** Agosto 2025  
**Tecnologías:** Node.js, Express.js, HTML5, CSS3, JavaScript ES6  
**Estado:** En Desarrollo - Funcionalidad Básica Implementada  

## Descripción del Proyecto

El Portal de Evaluación Académica IEM es una plataforma web diseñada para la Institución Educativa Mojarras que permite a los estudiantes realizar exámenes, actividades y pruebas académicas de forma digital. La plataforma cuenta con un sistema de autenticación basado en códigos estudiantiles y ofrece diferentes áreas de evaluación.

## Arquitectura del Sistema

### Estructura de Directorios

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```

```
plataforma_examenes/
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
│   ├── architecture/   # Documentación de arquitectura
│   ├── development/    # Documentación de desarrollo (setup, testing, contributing)
│   ├── project/        # Documentación general del proyecto (changelog, license)
│   └── internal/       # Documentación interna (revisiones, notas)
├── test/               # Pruebas unitarias y de integración
├── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación (redirecciona a login)
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```


### Tecnologías Utilizadas

#### Backend
- **Node.js 20.18.0**: Entorno de ejecución JavaScript
- **Express.js 4.19.2**: Framework web para Node.js
- **CORS**: Middleware para permitir peticiones cross-origin
- **Helmet**: Middleware de seguridad
- **Morgan**: Logger de peticiones HTTP
- **Body-parser**: Parser de cuerpos de peticiones
- **Moment.js**: Manejo de fechas y tiempo
- **UUID**: Generación de identificadores únicos

#### Frontend
- **HTML5**: Estructura de las páginas
- **CSS3**: Estilos y diseño responsivo
- **JavaScript ES6**: Lógica del cliente
- **Font Awesome 6.0.0**: Iconografía

#### Base de Datos
- **JSON Files**: Almacenamiento en archivos JSON para simplicidad
  - `usuarios.json`: Información de estudiantes
  - `examenes.json`: Configuración de áreas de evaluación
  - `resultados.json`: Historial de resultados
  - `configuracion.json`: Configuración del sistema

## Funcionalidades Implementadas

### 1. Sistema de Autenticación

#### Características
- Validación de códigos estudiantiles con formato IEMdddd
- Verificación contra base de datos de usuarios permitidos
- Redirección automática al dashboard tras login exitoso
- Manejo de errores de autenticación

#### Archivos Involucrados
- `index.html`: Interfaz de login
- `frontend/js/script.js`: Lógica de validación
- `frontend/js/validacion.js`: Funciones auxiliares
- `backend/server.js`: API de validación

#### API Endpoints
```javascript
POST /api/validar
// Valida código estudiantil
// Body: { codigo: "IEM1001" }
// Response: { permitido: true, nombre: "Ana María García", grado: "9A" }
```

### 2. Dashboard Principal

#### Características
- Diseño moderno con gradiente verde institucional
- Header con logo y información del usuario
- Avatar con iniciales del primer nombre y primer apellido
- Tres tarjetas de actividades principales:
  - **Preunal**: Simulacro Universidad Nacional
  - **Preicfes**: Simulacro Pruebas Saber
  - **Laboratorios**: Pruebas interactivas
- Botón de cerrar sesión
- Diseño responsivo para móviles

#### Archivos Involucrados
- `frontend/pages/inicio.html`: Estructura del dashboard
- `frontend/css/dashboard.css`: Estilos específicos
- `frontend/js/dashboard.js`: Lógica de interacción

#### Funciones JavaScript Principales
```javascript
class Dashboard {
    loadUserData()          // Carga información del usuario
    updateUserInterface()   // Actualiza la interfaz
    showActivitiesView()    // Muestra vista de actividades
    showExamsView()         // Muestra áreas de examen
    getInitials(nombre)     // Genera iniciales para avatar
}
```

### 3. Sistema de Exámenes (Parcialmente Implementado)

#### Características Implementadas
- Página de examen con interfaz profesional
- Timer visual con cuenta regresiva
- Navegación entre preguntas
- Grid de preguntas con estado visual
- Modal de confirmación para finalizar
- Barra de progreso
- Prevención de salida accidental

#### Características Pendientes
- Integración completa con backend
- Carga real de preguntas desde base de datos
- Envío de respuestas al servidor
- Cálculo y almacenamiento de resultados

#### Archivos Involucrados
- `frontend/pages/examen.html`: Interfaz de examen
- `frontend/css/examen.css`: Estilos de examen
- `frontend/js/examen.js`: Lógica de examen

### 4. API Backend

#### Rutas Implementadas

##### Autenticación
```javascript
POST /api/validar           // Validar código estudiantil
POST /api/logout           // Cerrar sesión
GET /api/usuario/:codigo   // Obtener datos del usuario
```

##### Exámenes
```javascript
GET /api/examenes                    // Listar áreas disponibles
GET /api/examenes/:area             // Información de área específica
POST /api/examenes/:area/iniciar    // Iniciar examen
POST /api/examenes/:area/responder  // Guardar respuesta
POST /api/examenes/:area/finalizar  // Finalizar examen
```

##### Resultados
```javascript
GET /api/resultados/:codigo              // Historial del estudiante
GET /api/resultados/:codigo/:resultado_id // Resultado específico
```

#### Middleware Implementado
- **CORS**: Permite peticiones desde cualquier origen
- **Helmet**: Seguridad básica HTTP
- **Morgan**: Logging de peticiones
- **Body Parser**: Procesamiento de JSON y URL-encoded
- **Static Files**: Servir archivos del frontend

## Base de Datos

### Estructura de Usuarios (usuarios.json)
```json
{
  "usuarios_permitidos": ["IEM1001", "IEM1002", "IEM1003"],
  "nombres": {
    "IEM1001": {
      "nombre_completo": "Ana María García",
      "grado": "9A",
      "activo": true
    }
  }
}
```

### Estructura de Exámenes (examenes.json)
```json
{
  "matematicas": {
    "nombre": "Matemáticas",
    "descripcion": "Evaluación de conceptos matemáticos",
    "tiempo_limite": 30,
    "numero_preguntas": 10,
    "activo": true,
    "preguntas": [
      {
        "id": 1,
        "tipo": "multiple_choice",
        "pregunta": "¿Cuál es el resultado de 2+2?",
        "opciones": ["3", "4", "5", "6"],
        "respuesta_correcta": 1,
        "puntos": 2
      }
    ]
  }
}
```

### Estructura de Resultados (resultados.json)
```json
{
  "IEM1001": [
    {
      "id": "uuid-resultado",
      "fecha": "2025-08-15T10:30:00Z",
      "area": "matematicas",
      "puntuacion": 18,
      "puntuacion_maxima": 20,
      "porcentaje": 90,
      "tiempo_usado": 25,
      "estado": "completado"
    }
  ]
}
```

## Configuración y Despliegue

### Requisitos del Sistema
- Node.js >= 18.0.0
- NPM >= 8.0.0
- Puerto 8000 disponible

### Instalación
```bash
# Clonar o descargar el proyecto
cd plataforma_examenes

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

### Variables de Entorno
```bash
PORT=8000                    # Puerto del servidor (opcional)
NODE_ENV=development         # Entorno de ejecución
```

### Archivos de Configuración

#### package.json
```json
{
  "name": "portal-evaluacion-iem",
  "version": "1.0.0",
  "description": "Portal de evaluación académica para IEM",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "body-parser": "^1.20.2",
    "moment": "^2.30.1",
    "uuid": "^10.0.0"
  }
}
```

## Seguridad

### Medidas Implementadas
- **Helmet.js**: Headers de seguridad HTTP
- **CORS configurado**: Control de acceso cross-origin
- **Validación de entrada**: Verificación de códigos estudiantiles
- **Prevención de inyección**: Uso de parámetros seguros

### Medidas Pendientes
- Autenticación con tokens JWT
- Encriptación de datos sensibles
- Rate limiting para APIs
- Validación más robusta en frontend
- Sanitización de inputs

## Rendimiento

### Optimizaciones Implementadas
- Archivos estáticos servidos por Express
- Compresión de respuestas HTTP
- Cache de archivos CSS/JS en navegador

### Optimizaciones Pendientes
- Minificación de archivos CSS/JS
- Compresión gzip
- CDN para recursos estáticos
- Lazy loading de imágenes

## Testing

### Estado Actual
- **Pruebas Manuales**: Realizadas en navegador
- **Pruebas Unitarias**: No implementadas
- **Pruebas de Integración**: No implementadas
- **Pruebas E2E**: No implementadas

### Recomendaciones
- Implementar Jest para pruebas unitarias
- Usar Supertest para pruebas de API
- Cypress para pruebas end-to-end
- Cobertura de código con Istanbul

## Monitoreo y Logging

### Implementado
- **Morgan**: Logging de peticiones HTTP
- **Console.log**: Logging básico de errores

### Recomendaciones
- Winston para logging estructurado
- Monitoreo de performance
- Alertas de errores
- Métricas de uso

## Mantenimiento

### Tareas Regulares
- Backup de archivos JSON
- Limpieza de logs antiguos
- Actualización de dependencias
- Revisión de seguridad

### Versionado
- Usar Git para control de versiones
- Semantic versioning (semver)
- Tags para releases
- Changelog detallado

## Próximos Desarrollos

### Prioridad Alta
1. **Completar funcionalidad de exámenes**
   - Integración frontend-backend
   - Cálculo de resultados
   - Página de resultados

2. **Sistema de resultados**
   - Historial de exámenes
   - Estadísticas de rendimiento
   - Exportación de datos

### Prioridad Media
3. **Panel administrativo**
   - Gestión de usuarios
   - Configuración de exámenes
   - Reportes estadísticos

4. **Mejoras de UX**
   - Notificaciones elegantes
   - Animaciones suaves
   - Mejor responsive design

### Prioridad Baja
5. **Funcionalidades avanzadas**
   - Exámenes con imágenes
   - Preguntas de desarrollo
   - Sistema de calificaciones

## Contacto y Soporte

**Desarrollador:** Manus AI  
**Fecha de Documentación:** 15 de Agosto de 2025  
**Versión de Documentación:** 1.0  

---

*Esta documentación será actualizada conforme el proyecto evolucione.*