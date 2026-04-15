# Plan NATURA: Ecosistema de Aprendizaje Interactivo

**Estado:** [COMPLETADO]
**Fecha de Creación:** 23 de marzo de 2026
**Objetivo Principal:** Transformar la experiencia del estudiante mediante una interfaz orgánica y un flujo de navegación por componentes, permitiendo la gestión dinámica de módulos (Preicfes, Preunal) desde el panel administrativo.

---

## 🌿 Fase 1: Identidad Visual y Dashboard Orgánico [COMPLETADA]

_Objetivo: Implementar la estética de `portal_estudiantil.html` en el núcleo de la aplicación._

- [x] **Estilos Globales**: Migrar el fondo vegetal, tipografías (Merriweather/Open Sans) y paleta de verdes a `frontend/css/global.css`.
- [x] **Refactor de Dashboard**: Actualizar `dashboard.html` para usar la estructura de tarjetas del prototipo.
- [x] **Tarjetas Dinámicas**: Implementar lógica para mostrar/ocultar paneles (Preicfes, Preunal, Laboratorios) basándose en la configuración del servidor.

---

## 🧩 Fase 2: Navegación por Componentes (Lobby de Simulacro) [COMPLETADA]

_Objetivo: Crear una estación intermedia entre el Dashboard y el Examen basada en `simulacro_interactivo.html`._

- [x] **Vista de Selección**: Implementar `frontend/pages/simulacro.html` para desglosar las áreas (Matemáticas, Sociales, etc.).
- [x] **Visualización de Progreso**: Integrar en tiempo real las notas obtenidas en cada componente dentro del panel de "Nota por componente".
- [x] **Flujo de Retorno**: Configurar el sistema para que al finalizar un examen, el usuario regrese al Lobby del simulacro con su nota actualizada, en lugar de ir al Dashboard general.

---

## ⚙️ Fase 3: Control Administrativo Dinámico [COMPLETADA]

_Objetivo: Permitir al administrador habilitar o deshabilitar módulos completos._

- [x] **Backend (Configuración)**: Añadir flags de visibilidad en la base de datos para `MODULE_PREICFES_ENABLED`, `MODULE_PREUNAL_ENABLED`, etc.
- [x] **Panel Admin**: Crear interruptores (toggles) en la sección de "Ajustes Globales" para controlar qué paneles ven los estudiantes.
- [x] **Acceso por Grado**: Refinar la lógica para que ciertos módulos (como Preunal) sean visibles solo para grados específicos (ej. 11°).

---

## 📊 Fase 4: API de Resumen de Desempeño [COMPLETADA]

_Objetivo: Servir los datos necesarios para el panel de puntajes del simulacro._

- [x] **Endpoint de Resumen**: Crear `/api/usuario/<codigo>/resumen_notas` que agrupe las mejores notas de cada área del último simulacro activo.
- [x] **Integración Frontend**: Sincronizar los valores de "0.0" en el panel de puntajes con datos reales del estudiante.

---

## 📝 Notas de Seguimiento

- _Sesión 31_: Creación del plan basada en los prototipos `portal_estudiantil.html` y `simulacro_interactivo.html`.
- _Sesión 37_: Implementación de la Fase 4 y refactorización de los lobbies para mayor seguridad y eficiencia.
