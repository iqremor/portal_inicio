# Registro de Errores y Revisiones Internas

## 2026-03-07 - Corrección de Indentación en API Routes

- **Archivo:** `backend/routes/api.py`
- **Error:** 404 Not Found en `/api/examenes/<id>/attempts`.
- **Causa:** La función `get_attempts` estaba indentada dentro de `get_examenes_por_grado`, lo que impedía que Flask la registrara en el blueprint.
- **Lección:** Verificar la estructura jerárquica de las funciones al usar decoradores `@blueprint.route`.
