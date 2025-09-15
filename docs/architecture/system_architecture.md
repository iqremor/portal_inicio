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
- **Tecnología**: Python + Flask
- **Puerto**: 5000
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

```mermaid
flowchart TD
    A[Usuario accede a la aplicación] --> B[Página LOGIN]
    
    B --> C{Ingresa ID válido?}
    C -->|No| D[Mostrar error<br/>ID no encontrado]
    D --> B
    C -->|Sí| E[Validar usuario activo<br/>y obtener grado]
    
    E --> F{Usuario activo?}
    F -->|No| G[Mostrar error<br/>Usuario inactivo]
    G --> B
    F -->|Sí| H[Página MAIN]
    
    H --> I[Mostrar exámenes disponibles<br/>para el grado del usuario]
    I --> J[Usuario selecciona examen]
    
    J --> K[Backend verifica intentos<br/>restantes para el examen]
    K --> L{Intentos disponibles?}
    L -->|No| M[Mostrar mensaje<br/>Sin intentos restantes]
    M --> N[Botón: Volver a MAIN]
    N --> H
    
    L -->|Sí| O[Seleccionar cuadernillo<br/>aleatorio para el grado]
    O --> P[Seleccionar 10 preguntas<br/>aleatorias del banco]
    P --> Q[Registrar inicio de intento<br/>en base de datos]
    Q --> R[Página EXAM]
    
    R --> S[Inicializar timer<br/>4 min por pregunta]
    S --> T[Mostrar pregunta actual<br/>imagen del cuadernillo]
    
    T --> U[Timer contando]
    U --> V{Han pasado 3 minutos?}
    V -->|No| W{Quedan 30 segundos?}
    W -->|Sí| X[Mostrar advertencia<br/>tiempo restante]
    W -->|No| U
    X --> U
    
    V -->|Sí| Y[Habilitar botón SIGUIENTE]
    Y --> Z[Usuario puede avanzar<br/>o esperar tiempo completo]
    
    Z --> AA{Se acabó el tiempo<br/>de la pregunta?}
    AA -->|No| BB{Usuario presiona SIGUIENTE?}
    BB -->|Sí| CC[Avanzar a siguiente pregunta]
    BB -->|No| AA
    
    AA -->|Sí| CC
    CC --> DD{Es la última pregunta?}
    DD -->|No| T
    DD -->|Sí| EE[Registrar fin de intento<br/>tiempo total empleado]
    
    EE --> FF[Reducir intentos restantes<br/>para este examen]
    FF --> GG[Página RESULT]
    
    GG --> HH[Mostrar información del intento:<br/>- Cuadernillo usado<br/>- Tiempo empleado<br/>- Fecha/hora<br/>- Intentos restantes]
    
    HH --> II[Botón: Volver a MAIN]
    II --> H
    
    %% Flujo de cierre de navegador/interrupción
    R --> JJ{Usuario cierra navegador<br/>o pierde conexión?}
    JJ -->|Sí| KK[Intento se considera<br/>como usado/fallido]
    KK --> FF
    
    %% Estilos
    classDef pageStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef processStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decisionStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef errorStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef timerStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class B,H,R,GG pageStyle
    class E,I,K,O,P,Q,EE,FF,HH processStyle
    class C,F,L,V,W,AA,BB,DD,JJ decisionStyle
    class D,G,M errorStyle
    class S,T,U,X,Y,Z,CC timerStyle
```

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

