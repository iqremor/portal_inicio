# Portal de Evaluación Académica IEM

## Descripción
Sistema web interactivo para evaluaciones académicas que permite a los estudiantes realizar pruebas en diferentes áreas del conocimiento. Desarrollado específicamente para la Institución Educativa Municipal (IEM).

## Características Principales
- 🔐 Sistema de autenticación por código estudiantil
- 📚 Evaluaciones en múltiples áreas curso de 6 a 11:
  - Matemáticas
  - Ciencias Naturales
  - Ciencias Sociales
  - Lectura 
  - Ingles (solo 9,10,11)
- ⏱️ Temporizador incorporado en las pruebas
- 📱 Diseño responsive
- 🎨 Interfaz moderna y profesional

## Tabla de Contenidos
- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Uso](#uso)
- [Flujo de la Aplicación](#flujo-de-la-aplicación)
- [APIs Disponibles](#apis-disponibles)
- [Solución de Problemas](#solución-de-problemas)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)
- [Versión](#versión)

## Tecnologías Utilizadas

### Backend
- **Python** - Lenguaje de programación principal.
- **Flask** - Microframework web para construir la API REST.
- **SQLAlchemy** - ORM para interactuar con la base de datos.

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (ES6+)** - Funcionalidad interactiva

### Base de Datos
- **SQLite** - Base de datos SQL ligera basada en un archivo, gestionada a través de SQLAlchemy.

## Estructura del Proyecto
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

## Instalación y Puesta en Marcha
Para instrucciones detalladas sobre la instalación y puesta en marcha, consulte [docs/development/setup.md](docs/development/setup.md).

## Uso
[Instrucciones sobre cómo usar la aplicación una vez instalada. Incluir cómo iniciar el servidor, acceder a la aplicación, y cualquier credencial de prueba.]

### Códigos de prueba disponibles
- `IEM0601` - Ana María García (Grado 6)
- `IEM0702` - Carlos Eduardo López (Grado 7)
- `IEM0803` - María José Rodríguez (Grado 8)
- `IEM0901` - Andrés Felipe Gómez (Grado 9)
- `IEM1001` - Laura Sofía Hernández (Grado 10)
- `IEM1101` - Maria Vargas (Grado 11)

## Flujo de la Aplicación
### 1. Autenticación
- El usuario ingresa su código estudiantil (formato: IEMdddd)
- El sistema valida el formato y verifica en la base de datos
- Si es válido, redirige al dashboard personalizado

### 2. Dashboard
- Muestra información personalizada del estudiante
- Lista las áreas de evaluación disponibles
- Permite ver resultados anteriores
- Opción de cerrar sesión

### 3. Selección de Examen
- El estudiante selecciona un área de evaluación
- Se muestra información detallada del examen
- Confirmación antes de iniciar

### 4. Realización del Examen
- Temporizador activo durante la evaluación
- Navegación entre preguntas
- Guardado automático de respuestas
- Finalización automática al agotar el tiempo

### 5. Resultados
- Cálculo automático de puntuación
- Almacenamiento en historial
- Visualización de resultados

## APIs Disponibles
Para una documentación detallada de las APIs disponibles, consulte [docs/architecture/api_endpoints.md](docs/architecture/api_endpoints.md).

## Solución de Problemas
Para problemas comunes y sus soluciones, consulte [docs/development/troubleshooting.md](docs/development/troubleshooting.md).

## Contribución
Para conocer cómo contribuir a este proyecto, consulte [docs/development/contributing.md](docs/development/contributing.md).

## Licencia
Este proyecto está bajo la Licencia MIT. Para más detalles, consulte [docs/project/license.md](docs/project/license.md).

## Contacto
- **Institución**: Institución Educativa Mojarras
- **Soporte**: razcarvajal@iem.edu.co
- **Teléfono**: 3192076175

## Versión
**v1.0.0** - Versión inicial del Portal de Evaluación Académica IEM

---

© 2025 Institución Educativa Mojarras - Portal de Evaluación Académica
