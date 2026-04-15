# 🎯 Plan FOCUS: Gestión Integral de Usuarios (Excel Sync & Manual)

**Estado:** [EN_PROGRESO]
**Fecha de Creación:** 15 de abril de 2026
**Objetivo Principal:** Implementar una herramienta administrativa robusta para la gestión total de la base de datos de usuarios (estudiantes), permitiendo la sincronización masiva mediante archivos (Excel/CSV) y la edición individual atómica.

---

## 📥 Fase 1: Sincronización Masiva y Plantillas [EN_PROGRESO]

_Objetivo: Desarrollar el motor de carga y las herramientas de preparación de datos._

- [ ] **Descarga de Plantilla Oficial**:
  - Botón para generar y descargar un archivo `.xlsx` o `.csv` pre-configurado.
  - El archivo incluirá las cabeceras obligatorias: `codigo`, `nombre_completo`, `grado`.
  - Incluirá una fila de ejemplo (instrucciones) para guiar al administrador.
- [ ] **Soporte Multi-Formato**: Habilitar el procesamiento de archivos `.xlsx`, `.xls` y `.csv`.
- [ ] **Lógica de Integración (Upsert)**:
  - **Sincronizar**: Si el `codigo` existe, actualiza los datos. Si es nuevo, lo crea.
  - **Contraseña por Defecto**: Los nuevos usuarios tendrán su `codigo` como clave inicial.
- [ ] **Lógica de Limpieza (Opcional)**: Interruptor para "Eliminar/Desactivar usuarios no listados en el archivo" (Sincronización Espejo).

---

## 👤 Fase 2: Gestión y Alta Individual [EN_ESPERA]

_Objetivo: Permitir ajustes rápidos y mantenimiento puntual._

- [ ] **Formulario Manual**: Interfaz para añadir un solo estudiante con validación de duplicados en tiempo real.
- [ ] **Edición en Caliente**: Permitir modificar nombres o grados directamente desde la lista de usuarios.
- [ ] **Reset Individual**: Botón para restaurar la contraseña de un usuario específico a su valor original (`codigo`).

---

## 🖥️ Fase 3: Interfaz Administrativa FOCUS [EN_ESPERA]

_Objetivo: Centralizar la experiencia de usuario en el panel de control._

- [ ] **Panel de Importación**: Nueva vista `GestionUsuariosView` con selector de archivos, zona de descarga de plantillas y log de operaciones.
- [ ] **Pre-visualización de Cambios**: Resumen estadístico antes de procesar (Ej: "Se añadirán 10, se actualizarán 5, se eliminarán 2").
- [ ] **Reporte de Errores**: Lista detallada de filas con datos inválidos o formatos incorrectos detectados durante la carga.

---

## 🛡️ Fase 4: Seguridad y Validación [EN_ESPERA]

_Objetivo: Garantizar la integridad y trazabilidad de los datos._

- [ ] **Protección de Jerarquías**: Impedir que la carga masiva afecte a usuarios con rol `ADMIN`.
- [ ] **Normalización de Datos**: Limpieza automática de espacios, tildes y formatos de grado inconsistentes.
- [ ] **Copia de Respaldo Automática**: Exportar la tabla `User` actual a un archivo de respaldo antes de iniciar cualquier sincronización masiva.

---

## 📝 Notas de Seguimiento

- _Sesión 37_: Aprobación e inicio del plan. Se define el alcance de la sincronización masiva y la gestión individual.
