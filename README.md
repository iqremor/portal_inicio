# Portal de Evaluación Académica IEM

## Descripción
Sistema web interactivo para evaluaciones académicas que permite a los estudiantes realizar pruebas en diferentes áreas del conocimiento. Desarrollado específicamente para la Institución Educativa Municipal (IEM).

## Características Principales
- 🔐 Sistema de autenticación por código estudiantil
- 📚 Evaluaciones en múltiples áreas:
  - Matemáticas
  - Ciencias Naturales
  - Ciencias Sociales
  - Análisis de Imagen
  - Comprensión de Textos
- ⏱️ Temporizador incorporado en las pruebas
- 📊 Sistema de puntuación estandarizado
- 💾 Almacenamiento de resultados
- 📱 Diseño responsive
- 🎨 Interfaz moderna y profesional

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **CORS** - Manejo de peticiones cross-origin
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de peticiones
- **Moment.js** - Manejo de fechas
- **UUID** - Generación de identificadores únicos

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (ES6+)** - Funcionalidad interactiva
- **Font Awesome** - Iconografía
- **Google Fonts** - Tipografía

### Base de Datos
- **JSON Files** - Almacenamiento de datos (usuarios, exámenes, resultados)

## Estructura del Proyecto

```
plataforma_examenes/
├── backend/
│   └── server.js              # Servidor Express principal
├── frontend/
│   ├── css/
│   │   ├── styles.css         # Estilos principales
│   │   └── dashboard.css      # Estilos del dashboard
│   ├── js/
│   │   ├── script.js          # JavaScript principal
│   │   ├── validacion.js      # Funciones de validación
│   │   └── dashboard.js       # JavaScript del dashboard
│   └── pages/
│       └── inicio.html        # Página del dashboard
├── data/
│   ├── usuarios.json          # Base de datos de usuarios
│   ├── examenes.json          # Banco de preguntas
│   ├── resultados.json        # Historial de evaluaciones
│   └── configuracion.json     # Configuración del sistema
├── docs/
│   └── arquitectura.md        # Documentación de arquitectura
├── index.html                 # Página principal de login
├── package.json               # Dependencias y scripts
└── README.md                  # Este archivo
```

## Requisitos Previos
- Node.js >= 14.x
- npm >= 6.0.0
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## Instalación

1. **Clonar o descargar el proyecto:**
```bash
cd plataforma_examenes
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Verificar archivos de datos:**
Los archivos JSON en la carpeta `data/` ya están configurados con datos de ejemplo.

## Uso

### Iniciar el servidor
```bash
npm start
```

El servidor se iniciará en `http://localhost:8000`

### Acceder a la aplicación
1. Abrir el navegador web
2. Visitar `http://localhost:8000`
3. Ingresar con un código estudiantil válido

### Códigos de prueba disponibles
- `IEM1001` - Ana María García (Grado 9A)
- `IEM1002` - Carlos Eduardo López (Grado 9A)
- `IEM1003` - María José Rodríguez (Grado 9B)
- `IEM2001` - Andrés Felipe Gómez (Grado 10A)
- `IEM3001` - Isabella Vargas (Grado 11A)

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

### Autenticación
- `POST /api/validar` - Validar código estudiantil
- `POST /api/logout` - Cerrar sesión

### Exámenes
- `GET /api/examenes` - Listar áreas disponibles
- `GET /api/examenes/:area` - Información de examen específico
- `POST /api/examenes/:area/iniciar` - Iniciar examen
- `POST /api/examenes/:area/responder` - Enviar respuesta
- `POST /api/examenes/:area/finalizar` - Finalizar examen

### Resultados
- `GET /api/resultados/:codigo` - Historial del estudiante
- `GET /api/resultados/:codigo/:resultado_id` - Resultado específico

## Configuración

### Archivo de configuración (`data/configuracion.json`)
```json
{
  "sistema": {
    "puerto": 8000,
    "modo_desarrollo": true
  },
  "examenes": {
    "intentos_maximos": 3,
    "tiempo_gracia": 5,
    "guardado_automatico": true
  },
  "puntuacion": {
    "escala_maxima": 100,
    "nota_minima_aprobacion": 60
  }
}
```

## Seguridad
- Validación de formato de código estudiantil
- Verificación de usuario activo en base de datos
- Tiempo límite por examen
- Prevención de múltiples intentos simultáneos
- Headers de seguridad con Helmet
- Logging de todas las peticiones

## Características Técnicas
- **Diseño Responsivo**: Adaptable a dispositivos móviles y desktop
- **Interfaz Moderna**: Gradientes, animaciones y micro-interacciones
- **Validación en Tiempo Real**: Feedback inmediato al usuario
- **Manejo de Errores**: Mensajes informativos y recuperación elegante
- **Accesibilidad**: Navegación por teclado y lectores de pantalla
- **Performance**: Carga optimizada de recursos

## Scripts Disponibles
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en modo desarrollo (con nodemon)
- `npm test` - Ejecutar pruebas
- `npm run lint` - Verificar código con ESLint

## Desarrollo

### Agregar nuevos usuarios
Editar `data/usuarios.json`:
```json
{
  "usuarios_permitidos": ["IEM1234"],
  "nombres": {
    "IEM1234": {
      "nombre_completo": "Nuevo Estudiante",
      "grado": "10A",
      "activo": true,
      "fecha_registro": "2025-01-08"
    }
  }
}
```

### Agregar nuevas preguntas
Editar `data/examenes.json` y agregar preguntas al área correspondiente:
```json
{
  "id": 6,
  "tipo": "multiple",
  "pregunta": "Nueva pregunta",
  "opciones": ["A", "B", "C", "D"],
  "respuesta_correcta": 0,
  "puntos": 1,
  "dificultad": "medio"
}
```

## Solución de Problemas

### El servidor no inicia
- Verificar que Node.js esté instalado
- Ejecutar `npm install` para instalar dependencias
- Verificar que el puerto 8000 esté disponible

### Los estilos no cargan
- Verificar que los archivos CSS estén en `frontend/css/`
- Revisar la consola del navegador para errores 404
- Verificar la configuración de archivos estáticos en `server.js`

### Error de autenticación
- Verificar que el código tenga formato `IEMdddd`
- Comprobar que el código esté en `usuarios_permitidos`
- Verificar que el usuario esté marcado como `activo: true`

## Contribución
1. Fork del proyecto
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto
- **Institución**: Institución Educativa Municipal
- **Soporte**: evaluaciones@iem.edu.co
- **Teléfono**: ext. 123

## Versión
**v1.0.0** - Versión inicial del Portal de Evaluación Académica IEM

---

© 2025 Institución Educativa Municipal - Portal de Evaluación Académica

