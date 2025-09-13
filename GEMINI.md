# Configuración general para el manejo de proyectos 
 
## 📊 Análisis del Repositorio: [NOMBRE_PROYECTO]

### Resumen Ejecutivo
- **Puntuación General:** X/100
- **Tecnología Principal:** [TECNOLOGÍA]
- **Estado General:** [EXCELENTE/BUENO/NECESITA_MEJORAS/CRÍTICO]

### Resultados por Sección
1. Estructura del Repositorio: X/10
2. Documentación: X/10
[... continuar con todas las secciones]

### Top 3 Áreas Críticas
1. [ÁREA] - [DESCRIPCIÓN DEL PROBLEMA]
2. [ÁREA] - [DESCRIPCIÓN DEL PROBLEMA]
3. [ÁREA] - [DESCRIPCIÓN DEL PROBLEMA]

### Recomendaciones Prioritarias
- [ ] [ACCIÓN INMEDIATA 1]
- [ ] [ACCIÓN INMEDIATA 2]
- [ ] [ACCIÓN INMEDIATA 3]

### Validación de Configuración
Despues de realizar el analisis puede validar esto antes de comenzar el desarrollo:
- [ ] Revise la estructura de carpetas.
- [ ] Confirme si el directorio `demo/` está creado, si no cree uno.
- [ ] Revise las ramas del proyecto
- [ ] Sugiera las 3 ramas principales configuradas (main, develop, debug)
- [ ] Herramientas de calidad configuradas (linters, formatters, analyzers)
- [ ] Git hooks instalados (pre-commit, pre-push)
- [ ] Testing framework configurado
- [ ] Documentación base generada (incluyendo CODE_STYLE.md y CONTRIBUTING.md)
- [ ] Git inicializado y configurado
- [ ] Dependencias instaladas y auditadas
- [ ] Primera sesión documentada
- [ ] Plantillas específicas configuradas
- [ ] Prototipos iniciales creados en `prototype/`
- [ ] Métricas de calidad baseline establecidas# Plantilla para Desarrollo de Proyectos con IA Assistant

## 1. Configuración Inicial del Proyecto

### 1.1. Cuestionario de Configuración

Cuando el usuario inicie un nuevo proyecto, el asistente debe realizar las siguientes preguntas para configurar la plantilla:

#### Información Básica
1. **Nombre del proyecto:** ¿Cuál es el nombre de tu proyecto?
2. **Tipo de proyecto:** 
   - [ ] Aplicación Web Frontend
   - [ ] API/Backend
   - [ ] Aplicación Full-Stack
   - [ ] Aplicación Móvil
   - [ ] Biblioteca/Package
   - [ ] Documentación/Presentación
   - [ ] Otro (especificar)

3. **Tecnologías principales:** ¿Qué tecnologías planeas usar?
   - Frontend: React, Vue, Angular, Vanilla JS, otro
   - Backend: Node.js, Python, Java, C#, otro
   - Base de datos: MongoDB, PostgreSQL, MySQL, otro
   - Herramientas: Webpack, Vite, Docker, otro

4. **Nivel de complejidad:**
   - [ ] Básico (prototipo/demo)
   - [ ] Intermedio (aplicación funcional)
   - [ ] Avanzado (aplicación de producción)

5. **Público objetivo:** ¿Para quién está dirigido el proyecto?
6. **Plazo estimado:** ¿Cuál es el tiempo estimado de desarrollo?

### 1.2. Estructura de Carpetas Base

```
{nombre_proyecto}/
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── CODE_STYLE.md
│   ├── CONTRIBUTING.md
│   └── API.md (si aplica)
├── log/
│   ├── PROJECT_SETUP.md
│   ├── SESSION_LOG.md
│   ├── CODE_QUALITY.md
│   └── GIT_WORKFLOW.md
├── prototype/
│   ├── README.md
│   ├── demos/
│   ├── examples/
│   ├── proof_of_concept/
│   └── reference_scripts/
├── src/
│   ├── [estructura específica del tipo de proyecto]
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── tools/
│   ├── linters/
│   ├── formatters/
│   └── quality_checks/
├── .gitignore
├── .editorconfig
├── .eslintrc.js (si aplica)
├── .prettierrc (si aplica)
├── package.json (si aplica)
└── [archivos de configuración específicos]
```

## 2. Flujos de Trabajo Automatizados

### 2.1. Flujo de Inicio de Sesión

**Palabras clave:** "inicio de sesión", "hola", "comenzar", "iniciar proyecto"

**Proceso:**
1. **Análisis del contexto:** Revisar documentación existente en `log/`
2. **Estado del proyecto:** Verificar últimos commits y archivos modificados
3. **Revisión de calidad:** Ejecutar checks automáticos de código si existen
4. **Resumen de la sesión anterior:** Mostrar progreso, deuda técnica y próximos pasos
5. **Creación de nueva sesión:** Generar entrada en `log/SESSION_LOG.md`

```markdown
## Sesión [NÚMERO] - [FECHA] [HORA_INICIO]
### Objetivos de la sesión:
- 
### Estado inicial:
- Calidad de código: [ANÁLISIS_AUTOMÁTICO]
- Deuda técnica: [PENDIENTES_REFACTOR]
- Tests: [COBERTURA_ACTUAL]
### Finalización: [PENDIENTE]
```

### 2.2. Flujo de Guardado de Cambios

**Palabras clave:** "guarde los cambios", "commit", "guardar versión"

**Proceso:**
1. **Análisis de cambios:** Detectar archivos modificados desde último commit
2. **Verificación de calidad:** Ejecutar linters, formatters y análisis estático
3. **Verificación de rama:** Asegurar que se está en la rama correcta (develop para desarrollo, debug para correcciones)
4. **Validación de tests:** Ejecutar tests relacionados con los cambios
5. **Generación de propuestas:** Crear 3 mensajes de commit descriptivos
6. **Autorización:** Presentar opciones al usuario para selección
7. **Ejecución:** Realizar commit con mensaje seleccionado
8. **Post-commit:** Actualizar métricas de calidad en `log/CODE_QUALITY.md`

**Checks automáticos antes de commit:**
- Formateo de código consistente
- Linting sin errores críticos
- Tests unitarios pasando
- Documentación actualizada (si es necesario)
- Sin código comentado o debug statements

**Tipos de commit sugeridos:**
- `feat:` nueva funcionalidad
- `fix:` corrección de errores  
- `debug:` correcciones de debugging
- `docs:` cambios en documentación
- `style:` cambios de formato/estilo
- `refactor:` refactorización de código
- `test:` adición/modificación de tests
- `proto:` cambios en prototipos o demos
- `chore:` tareas de mantenimiento
- `perf:` mejoras de rendimiento

### 2.3. Flujo de Cierre de Sesión

**Palabras clave:** "cerrar sesión", "finalizar", "terminar", "adiós"

**Proceso:**
1. **Revisión de calidad de la sesión:** Generar reporte de calidad del código trabajado
2. **Consulta de guardado:** "¿Desea guardar en repositorio Git la sesión actual?"
3. **Guardado condicional:** Ejecutar flujo 2.2 si es afirmativo
4. **Documentación de sesión:** Completar entrada en `log/SESSION_LOG.md`
5. **Actualización de métricas:** Actualizar `log/CODE_QUALITY.md` con métricas de la sesión
6. **Sugerencias de mejora:** Proponer refactorizaciones o mejoras para próximas sesiones
7. **Limpieza:** Borrar datos temporales de sesión

## 3. Sistema de Documentación

### 3.1. Documentos Obligatorios

#### README.md
```markdown
# {Nombre del Proyecto}

## Descripción
{Descripción breve del proyecto}

## Tecnologías
{Lista de tecnologías utilizadas}

## Instalación
{Pasos para instalar el proyecto}

## Uso
{Instrucciones de uso básico}

## Contribución
{Guías para contribuir al proyecto}
```

#### ARCHITECTURE.md
```markdown
# Arquitectura del Proyecto

## Visión General
{Descripción de la arquitectura general}

## Componentes Principales
{Lista y descripción de componentes}

## Flujo de Datos
{Descripción del flujo de información}

## Decisiones de Diseño
{Justificación de decisiones arquitectónicas}

## Patrones Utilizados
{Patrones de diseño implementados}

## Deuda Técnica
{Identificación y plan para resolver deuda técnica}
```

#### CONTRIBUTING.md
```markdown
# Guía de Contribución

## Estándares de Código

### Formateo
- Usar 2 espacios para indentación (4 para Python)
- Líneas máximo 80-120 caracteres
- Trailing spaces eliminados

### Naming Conventions
- Variables: camelCase (JS) / snake_case (Python)
- Funciones: verbo + sustantivo descriptivo
- Clases: PascalCase
- Constantes: UPPER_CASE

### Documentación
- Todas las funciones públicas deben tener documentación
- README actualizado con cada feature
- Comentarios en código complejo solamente

## Testing
- Cobertura mínima del 80%
- Tests unitarios para lógica de negocio
- Tests de integración para APIs
- Naming: describe_what_it_should_do

## Code Review
- Máximo 400 líneas por PR
- Self-review antes de submit
- Al menos un reviewer
```

#### CODE_STYLE.md
```markdown
# Guía de Estilo de Código

## Principios Generales
1. **Claridad sobre cleverness**: Código claro y legible
2. **DRY (Don't Repeat Yourself)**: Evitar duplicación
3. **SOLID**: Principios de diseño orientado a objetos
4. **KISS (Keep It Simple, Stupid)**: Simplicidad ante todo
5. **Patrones de diseño**:
   
## Estructura de Archivos
- Un componente/clase por archivo
- Imports organizados: externos → internos → relativos
- Exports al final del archivo

## Manejo de Errores
- Siempre manejar errores explícitamente
- Logging apropiado para debugging
- No silenciar excepciones

## Performance
- Evitar optimizaciones prematuras
- Medir antes de optimizar
- Documentar decisiones de performance
```

### 3.2. Logs de Desarrollo

#### PROJECT_SETUP.md
- Configuración inicial del proyecto
- Decisiones tomadas durante setup
- Dependencias instaladas y justificación
- Herramientas de calidad configuradas

#### SESSION_LOG.md
- Registro cronológico de sesiones de trabajo
- Objetivos, cambios realizados, errores encontrados
- Métricas de productividad y calidad
- Deuda técnica identificada y resuelta

#### CODE_QUALITY.md
- Métricas de calidad por sesión
- Evolución de la cobertura de tests
- Análisis de complejidad ciclomática
- Alertas de code smells y su resolución
- Tendencias de mejora o deterioro

#### GIT_WORKFLOW.md
- Estrategia de branching utilizada
- Convenciones de commit
- Políticas de merge/release
- Historial de hotfixes y su análisis

## 4. Configuraciones por Tipo de Proyecto

### 4.1. Aplicación Web Frontend

**Estructura específica:**
```
src/
├── components/
├── pages/
├── assets/
├── styles/
├── utils/
├── hooks/ (si React)
└── store/ (si manejo de estado)
```

**Herramientas recomendadas:**
- Bundler: Vite, Webpack
- Testing: Jest, Cypress, React Testing Library
- Linting: ESLint, Prettier
- Type checking: TypeScript, PropTypes
- Code quality: SonarQube, CodeClimate
- Performance: Lighthouse, Bundle Analyzer

### 4.2. API/Backend

**Estructura específica:**
```
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── config/
└── utils/
```

**Herramientas recomendadas:**
- Testing: Jest, Supertest, Postman/Newman
- Documentación: Swagger/OpenAPI, JSDoc
- Validación: Joi, Yup, express-validator
- Linting: ESLint, Prettier
- Security: Helmet, OWASP ZAP
- Performance: Artillery, k6

### 4.3. Aplicación Full-Stack

**Estructura específica:**
```
├── client/ (frontend)
├── server/ (backend)
├── shared/ (código compartido)
└── database/ (migraciones, seeds)
```

### 4.4. Aplicación Desktop GUI

**Estructura específica:**
```
src/
├── gui/
│   ├── windows/
│   ├── components/
│   └── dialogs/
├── core/
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
├── config/
└── utils/
```

**Herramientas recomendadas:**
- Python: Tkinter, PyQt5/6, Kivy
- JavaScript: Electron, Tauri
- C#: WPF, Windows Forms
- Java: JavaFX, Swing
- C++: Qt, GTK
- Testing: Framework específico del lenguaje + UI testing tools
- Code quality: Static analyzers específicos por lenguaje
- Packaging: PyInstaller, Electron Builder, etc.

### 4.5. Aplicación Desktop CLI

**Estructura específica:**
```
src/
├── commands/
├── core/
├── config/
├── utils/
└── templates/
```

**Herramientas recomendadas:**
- Python: Click, argparse, Fire + Black, Pylint
- Node.js: Commander.js, Yargs + ESLint, Prettier
- Go: Cobra, urfave/cli + gofmt, golint
- Rust: clap, structopt + rustfmt, clippy
- Testing: Framework específico del lenguaje
- Documentation: Man pages, help systems

## 5. Comandos y Automatizaciones

### 5.1. Comandos Git Automatizados

```bash
# Inicialización del repositorio
git init
git branch -M main

# Configuración de las 3 ramas principales
git checkout -b develop     # Rama de desarrollo
git checkout -b debug       # Rama para debugging y correcciones
git checkout main           # Volver a rama principal

# Configuración inicial
git add .
git commit -m "feat: configuración inicial del proyecto"

# Push de todas las ramas
git push -u origin main
git push -u origin develop  
git push -u origin debug

# Políticas de commit
git config commit.template .gitmessage
```

**Estrategia de ramas:**
- `main`: Código estable de producción. Solo merge desde `develop` para releases
- `develop`: Integración de nuevas funcionalidades. Base para features branches
- `debug`: Rama específica para corrección de bugs y debugging. Merge a `develop` y `main` según urgencia

**Flujo de trabajo:**
1. **Desarrollo normal:** `develop` ← `feature/nombre`
2. **Corrección de bugs:** `debug` ← `bugfix/nombre`
3. **Emergencias:** `debug` → `main` (hotfix directo)
4. **Release:** `develop` → `main`

### 5.2. Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "comando de desarrollo",
    "build": "comando de build",
    "test": "comando de testing",
    "test:watch": "tests en modo watch",
    "test:coverage": "tests con cobertura",
    "lint": "comando de linting",
    "lint:fix": "auto-fix de linting",
    "format": "comando de formatting",
    "format:check": "verificar formato",
    "quality:check": "análisis de calidad completo",
    "pre-commit": "checks antes de commit",
    "docs": "generar documentación",
    "analyze": "análisis de bundle/código"
  }
}
```

### 5.3. Hooks de Git Automatizados

```bash
# Pre-commit hook
#!/bin/sh
echo "Ejecutando checks de calidad..."
npm run lint
npm run format:check
npm run test
npm run quality:check

if [ $? -ne 0 ]; then
    echo "❌ Checks de calidad fallaron. Commit cancelado."
    exit 1
fi

echo "✅ Todos los checks pasaron. Procediendo con commit..."
```

## 6. Métricas y Seguimiento

### 6.1. KPIs de Desarrollo y Calidad

**Métricas de Productividad:**
- Commits por sesión
- Tiempo por funcionalidad
- Velocidad de desarrollo (story points/sprint)

**Métricas de Calidad:**
- Cobertura de tests (mínimo 80%)
- Complejidad ciclomática (máximo 10)
- Deuda técnica acumulada (tiempo estimado para resolver)
- Code smells detectados vs resueltos
- Tiempo medio para fix de bugs

**Métricas de Proceso:**
- Tiempo de code review
- Frecuencia de hotfixes
- Ratio de bugs en producción
- Adherencia a estándares de código

### 6.2. Reportes Automáticos

Al final de cada sesión generar:
- **Resumen de productividad:** Líneas de código, commits, funcionalidades completadas
- **Análisis de calidad:** Cobertura de tests, complejidad, code smells
- **Deuda técnica:** Nuevos issues identificados y resueltos
- **Próximos pasos:** Sugerencias priorizadas de mejoras
- **Alertas de calidad:** Violaciones de estándares que requieren atención inmediata
- **Tendencias:** Evolución de métricas comparado con sesiones anteriores

**Formato del reporte:**
```markdown
## Reporte de Sesión [FECHA]

### 📊 Métricas de Calidad
- Cobertura de tests: 85% (+2% desde última sesión)
- Complejidad promedio: 6.2 (-0.3 desde última sesión)
- Code smells: 3 nuevos, 5 resueltos

### ⚠️ Alertas
- Función `processData()` excede complejidad máxima (15)
- Falta documentación en 3 métodos públicos nuevos

### 🎯 Próximas Prioridades
1. Refactorizar `processData()` para reducir complejidad
2. Añadir tests para nuevo módulo de autenticación
3. Actualizar documentación de API
```

## 7. Personalización y Extensiones

### 7.1. Templates Personalizados

El usuario puede crear templates específicos en:
```
templates/
├── component.template
├── page.template
├── api.template
└── test.template
```

### 7.2. Hooks y Automatizaciones

Definir hooks personalizados para:
- Pre-commit validations
- Post-commit actions
- Deploy automático
- Notificaciones

## 8. Flujo de Configuración Inicial

### 8.1. Comando de Inicialización

**Palabra clave:** "iniciar proyecto", "nuevo proyecto", "inicializar proyecto", "setup inicial"

**Proceso:**
1. Ejecutar cuestionario de configuración (sección 1.1)
2. Generar estructura de carpetas apropiada
3. Crear documentación base personalizada
4. Configurar Git con flujo de trabajo
5. Instalar dependencias base
6. Crear primera sesión de trabajo

### 8.2. Validación de Configuración

Antes de comenzar el desarrollo:
- [ ] Estructura de carpetas creada (incluyendo directorio `prototype/`)
- [ ] Las 3 ramas principales configuradas (main, develop, debug)
- [ ] Documentación base generada
- [ ] Git inicializado y configurado
- [ ] Dependencias instaladas
- [ ] Primera sesión documentada
- [ ] Plantillas específicas configuradas
- [ ] Prototipos iniciales creados en `prototype/`

## 10. Directorio Prototype - Guías y Referencias

### 10.1. Propósito del Directorio Prototype

El directorio `prototype/` es un espacio dedicado exclusivamente para:
- Scripts de demostración y proof of concept
- Ejemplos de referencia para el desarrollo
- Prototipos iniciales que sirven de guía
- Experimentos y pruebas técnicas

**Reglas importantes:**
- Los archivos en `prototype/` NO se mueven a `src/` 
- Pueden ser revisados, modificados y actualizados
- Sirven como documentación viva del proyecto
- Se mantienen versionados junto al proyecto principal

### 10.2. Estructura del Directorio Prototype

```
prototype/
├── README.md                    # Índice y descripción de prototipos
├── demos/                       # Demostraciones funcionales
│   ├── basic_example/
│   ├── advanced_features/
│   └── integration_test/
├── examples/                    # Ejemplos de código específicos
│   ├── api_usage.py
│   ├── gui_components.js
│   └── database_queries.sql
├── proof_of_concept/           # Validaciones técnicas
│   ├── performance_test/
│   ├── security_validation/
│   └── scalability_analysis/
└── reference_scripts/          # Scripts de utilidad y referencia
    ├── setup_environment.sh
    ├── data_migration.py
    └── deployment_test.js
```

### 10.3. README.md del Directorio Prototype

```markdown
# Prototipos y Referencias del Proyecto

## Índice de Contenido

### Demostraciones (demos/)
- **basic_example/**: Implementación básica de la funcionalidad principal
- **advanced_features/**: Características avanzadas y casos de uso complejos
- **integration_test/**: Pruebas de integración entre componentes

### Ejemplos (examples/)
- **api_usage**: Ejemplos de uso de APIs y servicios externos
- **gui_components**: Componentes de interfaz gráfica reutilizables
- **database_queries**: Consultas y operaciones de base de datos

### Proof of Concept (proof_of_concept/)
- **performance_test/**: Análisis y optimización de rendimiento
- **security_validation/**: Validaciones de seguridad implementadas
- **scalability_analysis/**: Estudios de escalabilidad del sistema

### Scripts de Referencia (reference_scripts/)
- **setup_environment**: Configuración automática del entorno de desarrollo
- **data_migration**: Scripts para migración de datos
- **deployment_test**: Pruebas de despliegue automatizado

## Uso de los Prototipos

1. **Consulta**: Revisar ejemplos antes de implementar nuevas funcionalidades
2. **Referencia**: Usar como base para decisiones arquitectónicas
3. **Testing**: Ejecutar demos para validar cambios
4. **Documentación**: Mantener actualizados con las mejores prácticas

## Mantenimiento

- Los prototipos se actualizan cuando hay cambios significativos en el proyecto principal
- Cada prototipo debe incluir su propio README con instrucciones de ejecución
- Se documentan las decisiones tomadas y las lecciones aprendidas
```

### 10.4. Integración en los Flujos de Trabajo

#### Durante Inicio de Sesión:
- Revisar prototipos relevantes para la tarea actual
- Mencionar ejemplos aplicables al trabajo planificado

#### Durante Desarrollo:
- Referenciar prototipos como guía de implementación
- Actualizar prototipos si se encuentran mejores soluciones

#### Durante Guardado de Cambios:
- Verificar si los cambios requieren actualización de prototipos
- Proponer creación de nuevos ejemplos si es necesario

## 11. Buenas Prácticas y Principios de Código Limpio

### 11.1. Principios SOLID Aplicados

**Single Responsibility Principle (SRP)**
- Cada clase/función debe tener una única razón para cambiar
- Separar lógica de presentación, negocio y datos

**Open/Closed Principle (OCP)**
- Abierto para extensión, cerrado para modificación
- Usar interfaces y composición sobre herencia

**Liskov Substitution Principle (LSP)**
- Las subclases deben ser sustituibles por sus clases base
- Mantener contratos consistentes

**Interface Segregation Principle (ISP)**
- Interfaces específicas mejor que interfaces generales
- Los clientes no deben depender de métodos que no usan

**Dependency Inversion Principle (DIP)**
- Depender de abstracciones, no de implementaciones concretas
- Inyección de dependencias para mayor testabilidad

### 11.2. Clean Code Practices

**Nombres Significativos:**
```javascript
// ❌ Malo
const d = new Date();
const u = users.filter(u => u.a > 18);

// ✅ Bueno  
const currentDate = new Date();
const adultUsers = users.filter(user => user.age > 18);
```

**Funciones Pequeñas y Enfocadas:**
```javascript
// ❌ Malo - función que hace demasiado
function processUserData(users) {
    // validación, transformación, guardado, notificación...
}

// ✅ Bueno - funciones específicas
function validateUsers(users) { /* ... */ }
function transformUserData(users) { /* ... */ }
function saveUsers(users) { /* ... */ }
function notifyProcessingComplete() { /* ... */ }
```

**Evitar Comentarios Innecesarios:**
```javascript
// ❌ Malo
i++; // incrementa i

// ✅ Bueno - el código se explica por sí mismo
currentIndex++;

// ✅ Aceptable - explica el "por qué", no el "qué"
// Incrementamos en lotes de 100 para evitar timeout de base de datos
batchSize = 100;
```

### 11.3. Code Smells y Refactoring

**Code Smells Comunes a Evitar:**
- **Duplicated Code**: Usar funciones/módulos reutilizables
- **Long Method**: Dividir en funciones más pequeñas
- **Large Class**: Aplicar Single Responsibility Principle
- **Long Parameter List**: Usar objetos de configuración
- **Divergent Change**: Una clase cambia por múltiples razones
- **Shotgun Surgery**: Un cambio requiere modificar múltiples clases

**Estrategias de Refactoring:**
1. **Extract Method**: Convertir código en función independiente
2. **Extract Variable**: Explicar expresiones complejas
3. **Inline Method**: Eliminar funciones triviales
4. **Move Method**: Reorganizar responsabilidades entre clases
5. **Replace Magic Number**: Usar constantes con nombres descriptivos

### 11.4. Testing como Práctica de Calidad

**Pirámide de Testing:**
```
        /\
       /  \     E2E Tests (Pocos)
      /____\    
     /      \   Integration Tests (Algunos)
    /________\  
   /          \ Unit Tests (Muchos)
  /__________\
```

**Principios de Testing:**
- **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely
- **AAA Pattern**: Arrange, Act, Assert
- **Given-When-Then**: Estructura para tests descriptivos

**Ejemplo de Test Bien Estructurado:**
```javascript
describe('UserService', () => {
    describe('when creating a new user', () => {
        it('should hash the password before saving', async () => {
            // Given
            const userData = { email: 'test@test.com', password: 'plaintext' };
            const mockHashFunction = jest.fn().mockReturnValue('hashedPassword');
            
            // When
            const result = await userService.createUser(userData, mockHashFunction);
            
            // Then
            expect(mockHashFunction).toHaveBeenCalledWith('plaintext');
            expect(result.password).toBe('hashedPassword');
        });
    });
});
```

### 11.5. Error Handling y Logging

**Manejo de Errores Apropiado:**
```javascript
// ❌ Malo - silenciar errores
try {
    riskyOperation();
} catch (error) {
    // ignorado
}

// ✅ Bueno - manejo explícito
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    logger.error('Failed to perform risky operation', { error, context });
    throw new OperationError('Unable to complete request', error);
}
```

**Logging Estructurado:**
```javascript
// ❌ Malo
console.log('User login failed');

// ✅ Bueno
logger.warn('Authentication failed', {
    userId: user.id,
    timestamp: new Date().toISOString(),
    ipAddress: request.ip,
    reason: 'invalid_password'
});
```

### 11.6. Performance y Optimización

**Principios de Optimización:**
1. **Medir primero**: Usar profilers y métricas reales
2. **Optimizar cuellos de botella**: No micro-optimizar sin datos
3. **Cachear apropiadamente**: Balance entre memoria y velocidad
4. **Lazy loading**: Cargar recursos cuando se necesiten

**Ejemplo de Optimización Medida:**
```javascript
// Antes de optimizar - medir performance
console.time('data-processing');
const result = processLargeDataset(data);
console.timeEnd('data-processing');

// Después de identificar bottleneck - optimizar específicamente
const optimizedResult = processLargeDatasetWithStreaming(data);
```

### 11.7. Security Best Practices

**Principios de Seguridad:**
- **Validación de Input**: Never trust user input
- **Principio de Menor Privilegio**: Acceso mínimo necesario
- **Defense in Depth**: Múltiples capas de seguridad
- **Fail Secure**: Fallar de manera segura

**Ejemplos de Implementación:**
```javascript
// Validación de input
function updateUser(userId, userData) {
    if (!isValidUserId(userId)) {
        throw new ValidationError('Invalid user ID format');
    }
    
    const sanitizedData = sanitizeUserData(userData);
    return userRepository.update(userId, sanitizedData);
}

// Logging sin información sensible
logger.info('User updated', {
    userId: user.id,
    fieldsUpdated: Object.keys(userData),
    // NO: password: userData.password
});
```

### 11.8. Code Review Guidelines

**Checklist para Code Reviews:**
- [ ] ¿El código es legible y autoexplicativo?
- [ ] ¿Sigue los estándares de estilo del proyecto?
- [ ] ¿Tiene tests apropiados?
- [ ] ¿Maneja errores correctamente?
- [ ] ¿No introduce vulnerabilidades de seguridad?
- [ ] ¿Es performante para el uso esperado?
- [ ] ¿La documentación está actualizada?
- [ ] ¿No duplica código existente?

**Cultura de Code Review:**
- Reviews constructivos, no destructivos
- Explicar el "por qué" en los comentarios
- Sugerir alternativas, no solo señalar problemas
- Reconocer código bien escrito

## 9. Mantenimiento y Evolución

### 9.1. Actualizaciones de Plantilla

- Versionado de la plantilla
- Migración de proyectos existentes
- Nuevas funcionalidades y mejoras
- Actualización de herramientas de calidad

### 9.2. Feedback y Mejora Continua

- Recolección de métricas de uso y calidad
- Identificación de patrones comunes y anti-patterns
- Optimización de flujos de trabajo
- Integración de nuevas herramientas y mejores prácticas
- Retrospectivas de código y procesos

## 12. Comandos y Atajos para IA Assistant

### 12.1. Comandos de Calidad de Código

**Palabras clave para activar revisiones:**
- **"revisar código"**: Ejecutar análisis completo de calidad
- **"refactorizar"**: Sugerir mejoras en código existente
- **"optimizar"**: Analizar performance y sugerir optimizaciones
- **"documentar"**: Generar/actualizar documentación del código
- **"tests"**: Revisar cobertura y calidad de tests

### 12.2. Flujo de Revisión de Calidad

**Proceso automático cuando se detectan issues:**
1. **Identificar problema**: Code smell, complejidad alta, etc.
2. **Sugerir solución**: Proponer refactoring específico
3. **Mostrar ejemplo**: Antes y después del cambio
4. **Validar impacto**: Verificar que tests siguen pasando
5. **Documentar decisión**: Actualizar logs de calidad

**Ejemplo de sugerencia:**
```markdown
🚨 **Code Smell Detectado**: Long Method

**Archivo**: src/services/userService.js
**Función**: processUserRegistration (85 líneas)
**Problema**: Función demasiado larga, múltiples responsabilidades

**Sugerencia de Refactoring**:
Dividir en:
- validateRegistrationData()
- hashPassword()
- saveUser()
- sendWelcomeEmail()
- logRegistrationEvent()

¿Desea que implemente esta refactorización?
```

### 12.3. Asistencia Proactiva

**El asistente debe:**
- Sugerir mejoras mientras el usuario escribe código
- Detectar patrones repetitivos y proponer abstracciones
- Recordar aplicar principios SOLID
- Alertar sobre posibles problemas de seguridad
- Proponer tests para nuevo código
- Sugerir documentación cuando sea necesaria

---

## 13. Futuros Flujos de Trabajo

Palabras clave adicionales para nuevos flujos de trabajo, las cuales deben ser sometidas a revisión del usuario:

## 🔄 **Flujos de Calidad y Revisión:**

### **"revisar código"** / **"code review"**
- Ejecutar análisis completo de calidad del código actual
- Detectar code smells, complejidad alta, duplicación
- Sugerir refactorizaciones específicas
- Generar reporte detallado de issues encontrados

### **"refactorizar"** / **"refactor"**
- Identificar código que necesita refactorización
- Proponer mejoras siguiendo principios SOLID
- Mostrar antes/después del cambio propuesto
- Validar que tests siguen pasando

### **"optimizar rendimiento"** / **"performance"**
- Analizar bottlenecks de performance
- Sugerir mejoras de eficiencia
- Revisar uso de memoria y CPU
- Proponer técnicas de caching u optimización

## 🧪 **Flujos de Testing:**

### **"ejecutar tests"** / **"run tests"**
- Correr suite completa de tests
- Generar reporte de cobertura
- Identificar tests faltantes
- Sugerir casos de prueba adicionales

### **"crear tests"** / **"generate tests"**
- Generar tests unitarios para código nuevo
- Crear tests de integración
- Proponer casos edge y de error
- Seguir patrones AAA (Arrange-Act-Assert)

## 📚 **Flujos de Documentación:**

### **"documentar"** / **"docs"**
- Generar/actualizar documentación del código
- Crear JSDoc o docstrings
- Actualizar README si es necesario
- Documentar decisiones arquitectónicas

### **"generar changelog"** / **"changelog"**
- Crear entrada en CHANGELOG.md
- Resumir cambios desde último release
- Categorizar cambios (feat, fix, breaking)

## 🔍 **Flujos de Debugging:**

### **"debug"** / **"depurar"**
- Cambiar a rama debug
- Activar modo debugging
- Sugerir puntos de breakpoint
- Ayudar a traced de problemas

### **"analizar error"** / **"analyze error"**
- Analizar logs de error
- Sugerir posibles causas
- Proponer soluciones
- Documentar fix aplicado

## 🚀 **Flujos de Deploy y Release:**

### **"preparar release"** / **"release"**
- Revisar checklist de release
- Actualizar versiones
- Generar notas de release
- Verificar que tests pasan

### **"deploy"** / **"desplegar"**
- Ejecutar checklist de deployment
- Verificar configuración de producción
- Crear backup si es necesario
- Monitorear post-deploy

## 🔐 **Flujos de Seguridad:**

### **"audit seguridad"** / **"security audit"**
- Revisar vulnerabilidades conocidas
- Analizar dependencias
- Verificar manejo de datos sensibles
- Sugerir mejoras de seguridad

### **"actualizar dependencias"** / **"update deps"**
- Revisar dependencias desactualizadas
- Verificar vulnerabilidades
- Proponer actualizaciones seguras
- Ejecutar tests después de actualizar

## 📊 **Flujos de Métricas y Análisis:**

### **"reporte calidad"** / **"quality report"**
- Generar reporte completo de métricas
- Mostrar tendencias de calidad
- Identificar áreas de mejora
- Comparar con sesiones anteriores

### **"análisis complejidad"** / **"complexity analysis"**
- Medir complejidad ciclomática
- Identificar funciones complejas
- Sugerir simplificaciones
- Establecer baseline de complejidad

## 🎯 **Flujos de Planificación:**

### **"planificar sesión"** / **"plan session"**
- Revisar backlog de tareas
- Priorizar issues de calidad
- Establecer objetivos de sesión
- Estimar tiempo necesario

### **"retrospectiva"** / **"retro"**
- Analizar sesiones anteriores
- Identificar patrones de problemas
- Proponer mejoras de proceso
- Actualizar workflows

## 🛠️ **Flujos de Configuración:**

### **"setup proyecto"** / **"project setup"**
- Ejecutar configuración inicial completa
- Instalar herramientas de calidad
- Configurar Git hooks
- Crear estructura base

### **"configurar herramientas"** / **"setup tools"**
- Configurar linters y formatters
- Setup de testing framework
- Configurar CI/CD básico
- Instalar dependencias de desarrollo

## **Top 5 Recomendados:**

1. **"revisar código"** - Para mantener calidad constante
2. **"ejecutar tests"** - Para validación continua
3. **"refactorizar"** - Para mejora continua del código
4. **"debug"** - Para resolución eficiente de problemas
5. **"reporte calidad"** - Para seguimiento de métricas
