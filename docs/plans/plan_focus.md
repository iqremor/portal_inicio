# 🎯 Plan FOCUS: Gestión Integral de Usuarios (Excel Sync & Manual)

**Estado:** [COMPLETADO]
**Fecha de Actualización:** 16 de abril de 2026
**Objetivo Principal:** Implementar una herramienta administrativa robusta para la gestión total de la base de datos de usuarios (estudiantes), permitiendo la sincronización masiva mediante archivos (Excel/CSV) y la edición individual atómica.

---

## 📥 Fase 1: Sincronización Masiva y Plantillas [COMPLETADO]

- [x] **Descarga de Plantilla Oficial**: Generación de Excel con cabeceras obligatorias.
- [x] **Soporte Multi-Formato**: Procesamiento de archivos `.xlsx` y `.csv`.
- [x] **Lógica de Integración (Upsert)**: Actualización de existentes y creación de nuevos.
- [x] **Sincronización Espejo**: Opción para desactivar usuarios no listados en el archivo.

---

## 👤 Fase 2: Gestión y Alta Individual [COMPLETADO]

- [x] **Formulario Manual**: Interfaz para añadir un solo estudiante.
- [x] **Reset Individual**: Botón para restaurar la contraseña (código de ingreso).

---

## 🖥️ Fase 3: Interfaz Administrativa FOCUS [COMPLETADO]

- [x] **Panel de Importación**: Nueva vista `GestionUsuariosView`.
- [x] **Reporte de Errores**: Lista detallada de fallos durante la carga.

---

## 🛡️ Fase 4: Seguridad y Validación [COMPLETADO]

_Objetivo: Garantizar la integridad y trazabilidad de los datos._

- [x] **Protección de Jerarquías**: Los administradores no pueden ser modificados por carga masiva.
- [x] **Normalización de Datos**: Limpieza de espacios, capitalización y estandarización de grados (6-11).
- [x] **Copia de Respaldo Automática**: Generación de archivos JSON en `instance/backups/` antes de cada operación masiva.

---

## 📝 Notas de Seguimiento

- _Sesión 37_: Inicio del plan y motor base.
- _Sesión 38_: Implementación de normalización, backups automáticos e infraestructura de testing. Plan marcado como COMPLETADO.
