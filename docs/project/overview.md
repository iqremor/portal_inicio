# Portal de Evaluación Académica IEM - Documentación Técnica

## Información General

**Nombre del Proyecto:** Portal de Evaluación Académica IEM  
**Versión:** 1.0.0  
**Fecha de Creación:** Agosto 2025  
**Tecnologías:** Python, Flask, HTML5, CSS3, JavaScript ES6  
**Estado:** En Desarrollo - Funcionalidad Básica Implementada  

## Descripción del Proyecto

El Portal de Evaluación Académica IEM es una plataforma web diseñada para la Institución Educativa Mojarras que permite a los estudiantes realizar exámenes, actividades y pruebas académicas de forma digital. La plataforma cuenta con un sistema de autenticación basado en códigos estudiantiles y ofrece diferentes áreas de evaluación.

## Arquitectura del Sistema

### Estructura de Directorios

```
portal_inicio/
├── docs/
│   ├── architecture/ # Documentación de arquitectura
│   │   ├── api_endpoints.md
│   │   ├── database.md
│   │   ├── monitoring_logging.md
│   │   ├── performance.md
│   │   ├── security.md
│   │   └── system_architecture.md
│   ├── development/ # Documentación de desarrollo
│   │   ├── contributing.md
│   │   ├── improvements.md
│   │   ├── maintenance.md
│   │   ├── setup.md
│   │   ├── testing.md
│   │   ├── troubleshooting.md
│   │   └── user_flow.md
│   ├── internal/ # Documentación interna
│   │   ├── error_revisions.md
│   │   └── next_revision.md
│   └── project/ # Documentación del proyecto
│       ├── changelog.md
│       ├── contact.md
│       ├── license.md
│       ├── overview.md
│       └── roadmap.md
├── prototype/ # Directorio para prototipos (vacío)
├── backend/
│   ├── app.py
│   └── data/
│       ├── configuracion.json
│       ├── examenes.json
│       ├── resultados.json
│       └── usuarios.json
├── data/ # Archivos de datos para grados
│   ├── grado 10/
│   ├── grado 11/
│   ├── grado 6/
│   ├── grado 7/
│   │   └── ciencias/
│   ├── grado 8/
│   └── grado 9/
├── frontend/
│   ├── css/
│   │   ├── dashboard.css
│   │   ├── examen.css
│   │   ├── global.css
│   │   ├── resultados.css
│   │   ├── styles.css
│   │   └── assets/
│   │       └── images/
│   ├── js/
│   │   ├── main.js
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── components/
│   │   │   ├── modal.js
│   │   │   └── notification.js
│   │   ├── pages/
│   │   │   ├── dashboard.js
│   │   │   ├── exam.js
│   │   │   ├── login.js
│   │   │   └── results.js
│   │   └── shared/
│   │       ├── auth.js
│   │       ├── timer.js
│   │       └── utils.js
│   └── pages/
│       ├── dashboard.html
│       ├── examen.html
│       ├── footer.html
│       ├── header.html
│       ├── login-form.html
│       ├── login.html
│       └── resultados.html
├── tests/ # Directorio para pruebas (vacío)
├── .gitignore
├── GEMINI.md
├── index.html
├── LICENSE
├── README.md
└──  requirements.txt

```


### Tecnologías Utilizadas

#### Backend
- **Python 3.11**: Lenguaje de programación.
- **Flask 2.2.2**: Framework web para Python.
- **Flask-SQLAlchemy**: Extensión para el manejo de bases de datos.
- **Flask-Migrate**: Extensión para migraciones de bases de datos.
- **Flask-Admin**: Extensión para la creación de interfaces de administración.

#### Frontend
- **HTML5**: Estructura de las páginas
- **CSS3**: Estilos y diseño responsivo
- **JavaScript ES6**: Lógica del cliente
- **Font Awesome 6.0.0**: Iconografía

#### Base de Datos
- **SQLite**: Base de datos relacional ligera para desarrollo, gestionada con **Flask-SQLAlchemy**.
- **JSON Files**: Utilizados únicamente para la inicialización (seeding) de la base de datos.

## Funcionalidades Implementadas

### 1. Sistema de Autenticación

#### Características
- Validación de códigos estudiantiles con formato IEMdddd
- Verificación contra base de datos de usuarios permitidos
- Redirección automática al dashboard tras login exitoso
- Manejo de errores de autenticación

#### Archivos Involucrados
- `index.html`: Interfaz de login
- `frontend/js/pages/login.js`: Lógica de validación
- `backend/app.py`: API de validación

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
- `frontend/pages/dashboard.html`: Estructura del dashboard
- `frontend/css/dashboard.css`: Estilos específicos
- `frontend/js/pages/dashboard.js`: Lógica de interacción

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
- `frontend/js/pages/exam.js`: Lógica de examen

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
- **Flask-CORS**: Permite peticiones desde cualquier origen

## Base de Datos

La estructura de datos principal ahora reside en los modelos de SQLAlchemy. Los siguientes ejemplos de JSON muestran el formato utilizado para el seeding de la base de datos.

### Estructura de Usuarios (Modelo SQLAlchemy)
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre_completo = db.Column(db.String(120), nullable=False)
    grado = db.Column(db.String(10), nullable=False)
    activo = db.Column(db.Boolean, default=True)
```

### Estructura de Cuadernillos (Modelo SQLAlchemy)
```python
class Cuadernillo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cuadernillo_id = db.Column(db.String(80), unique=True, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    grado = db.Column(db.String(50), nullable=False)
    area = db.Column(db.String(80), nullable=False)
    dir_banco = db.Column(db.String(200), nullable=False)
```

## Configuración y Despliegue

### Requisitos del Sistema
- Python >= 3.10
- pip >= 22.0
- Puerto 5000 disponible

### Instalación
```bash
# Clonar o descargar el proyecto
cd portal_inicio

# Crear y activar un entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
flask run
```

### Variables de Entorno
```bash
FLASK_APP=backend/app.py
FLASK_ENV=development         # Entorno de ejecución
```

## Seguridad

### Medidas Implementadas
- **Validación de entrada**: Verificación de códigos estudiantiles
- **Prevención de inyección**: Uso de parámetros seguros en SQLAlchemy

### Medidas Pendientes
- Autenticación con tokens JWT
- Encriptación de datos sensibles
- Rate limiting para APIs
- Validación más robusta en frontend
- Sanitización de inputs

## Rendimiento

### Optimizaciones Implementadas
- Archivos estáticos servidos por Flask
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
- Implementar Pytest para pruebas unitarias y de integración.
- Usar Selenium o Cypress para pruebas end-to-end.
- Cobertura de código con coverage.py.

## Monitoreo y Logging

### Implementado
- Logging básico de Flask

### Recomendaciones
- Logging estructurado con `logging` de Python.
- Monitoreo de performance con herramientas como `Flask-MonitoringDashboard`.
- Alertas de errores.
- Métricas de uso.

## Mantenimiento

### Tareas Regulares
- Backup de la base de datos.
- Limpieza de logs antiguos.
- Actualización de dependencias.
- Revisión de seguridad.

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
**Versión de Documentación:** 1.1 (Actualizado el 14 de Septiembre de 2025)

---

*Esta documentación será actualizada conforme el proyecto evolucione.*
