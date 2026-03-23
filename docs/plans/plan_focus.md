# Plan FOCUS: Configuración Dinámica de Exámenes

**Estado:** [EN_PROGRESO]
**Fecha de Actualización:** 23 de marzo de 2026
**Objetivo Principal:** Permitir al administrador controlar dinámicamente la cantidad de preguntas presentadas en cada sesión de examen desde el panel administrativo.

---

## ✅ Fase 1: Infraestructura de Configuración (Backend) - COMPLETADA

_Objetivo: Habilitar el almacenamiento y la edición del parámetro global._

- **Modelo de Datos**: Soporte para `EXAM_QUESTIONS_COUNT` en `ConfiguracionSistema`.
- **Vista Admin**: `ConfigExamenesView` actualizada para leer y guardar el parámetro.
- **Interfaz UI**: Campo añadido en "Ajustes Globales del Examen".

---

## ✅ Fase 2: Lógica de Sorteo Dinámico (API) - COMPLETADA

_Objetivo: Aplicar el límite configurado al generar el examen para el estudiante._

- **Modificar Endpoint de Inicio**: `get_exam_questions_by_session` ahora usa el valor dinámico.
- **Lógica de Sorteo**: Se mantiene `random.sample` sobre el total del banco, limitado por el nuevo ajuste.
- **Manejo de Excepciones**: Validación robusta para bancos con menos preguntas que el límite configurado.

---

## 🛠️ Fase 3: Validación y UX - PRÓXIMA

---

## 📝 Notas de Seguimiento

- _Sesión 29_: Creación del plan inicial tras finalizar el Plan PRISMA.
