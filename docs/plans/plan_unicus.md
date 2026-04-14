# Plan UNICUS: Control de Sesión Única y Seguridad de Acceso

**Estado:** [BORRADOR]
**Fecha de Creación:** 14 de abril de 2026
**Objetivo Principal:** Implementar una restricción de concurrencia que impida que un mismo usuario mantenga más de una sesión activa simultáneamente, garantizando la integridad de los exámenes y previniendo el uso compartido de cuentas.

## 📋 Fases del Plan

### Fase 1: Auditoría del Sistema de Sesiones

- Revisar el modelo `ActiveSession` en `backend/models.py` para asegurar que el campo `user_id` sea suficiente para la búsqueda.
- Analizar el flujo de autenticación en `backend/routes/web_main.py` y la generación de `session_id`.
- Verificar cómo el frontend almacena y valida el `session_id` actualmente.

### Fase 2: Lógica de Restricción (Backend)

- **Implementar Política de Desplazamiento:** Al iniciar una nueva sesión, el sistema debe buscar y eliminar cualquier entrada previa en la tabla `ActiveSession` para ese `user_id`.
- Modificar el endpoint de login para que, antes de crear una nueva sesión, invalide las anteriores.
- Asegurar que el cierre de sesión anterior sea "limpio" en la base de datos.

### Fase 3: Sincronización y Feedback (Frontend)

- Implementar un interceptor o lógica de verificación que detecte si el `session_id` almacenado ha sido invalidado por el servidor.
- Mostrar una alerta clara al usuario: _"Tu sesión ha sido cerrada porque se inició sesión en otro dispositivo"_.
- Redirigir automáticamente al login tras la invalidación.

### Fase 4: Validación y Pruebas

- Realizar pruebas de concurrencia abriendo el mismo usuario en diferentes navegadores.
- Verificar que los intentos de examen no se dupliquen ni se corrompan si una sesión es desplazada durante una prueba.

---

## 📝 Notas de Seguimiento

- _Sesión 36_: Creación del plan como respuesta a la necesidad de controlar la duplicidad de sesiones por usuario.
