# Arquitectura del Portal de Evaluación Académica IEM

## Visión General
Sistema web para evaluaciones académicas que permite a estudiantes realizar pruebas en diferentes áreas del conocimiento con autenticación por código estudiantil.

## Arquitectura del Sistema

### Frontend
- **Tecnología**: HTML5, CSS3, JavaScript (Vanilla)
- **Estructura**:
  - `index.html`: Página de login
  - `frontend/pages/`: Páginas de la aplicación
  - `frontend/js/`: Scripts de validación y funcionalidad
  - `frontend/css/`: Estilos responsivos
  - `frontend/images/`: Recursos gráficos

### Backend
- **Tecnología**: Node.js + Express
- **Puerto**: 8000
- **Funcionalidades**:
  - Autenticación de usuarios
  - Gestión de exámenes
  - Almacenamiento de resultados
  - API REST para frontend

### Base de Datos
- **Tipo**: Archivos JSON (para simplicidad)
- **Archivos**:
  - `usuarios.json`: Códigos estudiantiles y datos de usuarios
  - `examenes.json`: Banco de preguntas por área
  - `resultados.json`: Historial de evaluaciones
  - `configuracion.json`: Configuración del sistema

## Estructura de Datos

### usuarios.json
```json
{
  "usuarios_permitidos": ["IEM1234", "IEM5678"],
  "nombres": {
    "IEM1234": {
      "nombre_completo": "Juan Pérez",
      "grado": "10A",
      "activo": true
    }
  }
}
```

### examenes.json
```json
{
  "matematicas": {
    "nombre": "Matemáticas",
    "descripcion": "Evaluación de conceptos matemáticos",
    "tiempo_limite": 30,
    "preguntas": [
      {
        "id": 1,
        "tipo": "multiple",
        "pregunta": "¿Cuánto es 2 + 2?",
        "opciones": ["3", "4", "5", "6"],
        "respuesta_correcta": 1,
        "puntos": 1
      }
    ]
  }
}
```

### resultados.json
```json
{
  "IEM1234": [
    {
      "fecha": "2025-01-08T10:30:00Z",
      "area": "matematicas",
      "puntuacion": 85,
      "tiempo_usado": 25,
      "respuestas": [1, 0, 2, 1]
    }
  ]
}
```

## Flujo de la Aplicación

1. **Autenticación**
   - Usuario ingresa código IEM
   - Validación en frontend y backend
   - Redirección a dashboard

2. **Selección de Examen**
   - Lista de áreas disponibles
   - Información del examen (tiempo, preguntas)
   - Confirmación para iniciar

3. **Realización del Examen**
   - Temporizador activo
   - Navegación entre preguntas
   - Guardado automático de respuestas

4. **Finalización**
   - Cálculo de puntuación
   - Almacenamiento de resultados
   - Mostrar resultados al estudiante

## APIs del Backend

### Autenticación
- `POST /api/validar` - Validar código estudiantil
- `POST /api/logout` - Cerrar sesión

### Exámenes
- `GET /api/examenes` - Listar áreas disponibles
- `GET /api/examenes/:area` - Obtener examen específico
- `POST /api/examenes/:area/iniciar` - Iniciar examen
- `POST /api/examenes/:area/responder` - Enviar respuesta
- `POST /api/examenes/:area/finalizar` - Finalizar examen

### Resultados
- `GET /api/resultados/:codigo` - Historial del estudiante
- `GET /api/resultados/:codigo/:area` - Resultados por área

## Seguridad
- Validación de formato de código estudiantil
- Verificación de usuario activo
- Tiempo límite por examen
- Prevención de múltiples intentos simultáneos

## Características Técnicas
- Diseño responsivo (mobile-first)
- Almacenamiento local para sesión
- Manejo de errores robusto
- Interfaz intuitiva y accesible

