# Guía de Estilo de Código

## Principios Generales
1.  **Claridad sobre ingenio**: El código debe ser claro y legible.
2.  **DRY (Don't Repeat Yourself)**: Evitar la duplicación de código.
3.  **KISS (Keep It Simple, Stupid)**: Mantener la simplicidad ante todo.
4.  **Consistencia**: El estilo del código debe ser consistente en todo el proyecto.

## Estructura de Archivos
-   Un componente/clase por archivo.
-   Los imports se organizan en grupos: externos, internos y relativos.
-   Los exports se colocan al final del archivo en los módulos de JavaScript.

## Python (Backend)

### Formateo
-   Usar 4 espacios para la indentación.
-   Líneas con un máximo de 120 caracteres.
-   Seguir las convenciones de PEP 8.

### Naming Conventions
-   Variables y funciones: `snake_case` (ej. `mi_variable`, `mi_funcion`).
-   Clases: `PascalCase` (ej. `MiClase`).
-   Constantes: `UPPER_CASE` (ej. `MI_CONSTANTE`).

### Documentación
-   Todas las funciones públicas y complejas deben tener docstrings que expliquen su propósito, argumentos y valor de retorno.
-   Usar comentarios para explicar el "por qué" de un código complejo, no el "qué".

## JavaScript (Frontend)

### Formateo
-   Usar 4 espacios para la indentación.
-   Líneas con un máximo de 120 caracteres.
-   Usar punto y coma al final de las sentencias.

### Naming Conventions
-   Variables y funciones: `camelCase` (ej. `miVariable`, `miFuncion`).
-   Clases: `PascalCase` (ej. `MiClase`).
-   Constantes: `UPPER_CASE` (ej. `MI_CONSTANTE`).

### Variables
-   Usar `const` por defecto.
-   Usar `let` solo cuando la variable necesite ser reasignada.
-   Evitar el uso de `var`.

### Módulos
-   Usar módulos de ES6 (`import`/`export`).
-   Un módulo por archivo.

## Manejo de Errores
-   Siempre manejar los errores de forma explícita.
-   Usar bloques `try...catch` para operaciones que puedan fallar.
-   Registrar los errores con un nivel de severidad adecuado (INFO, WARNING, ERROR).
-   No silenciar excepciones.

## Pruebas
-   Los nombres de los tests deben ser descriptivos: `test_lo_que_hace_la_funcion`.
-   Cada test debe ser independiente.
-   Se debe buscar una alta cobertura de código en los tests.
