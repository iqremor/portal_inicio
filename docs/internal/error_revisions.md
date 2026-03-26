# Registro de Errores y Revisiones Internas

## 2026-03-07 - CorrecciÃ³n de IndentaciÃ³n en API Routes

- **Archivo:** `backend/routes/api.py`
- **Error:** 404 Not Found en `/api/examenes/<id>/attempts`.
- **Causa:** La funciÃ³n `get_attempts` estaba indentada dentro de `get_examenes_por_grado`, lo que impedÃ­a que Flask la registrara en el blueprint.
- **LecciÃ³n:** Verificar la estructura jerÃ¡rquica de las funciones al usar decoradores `@blueprint.route`.

## 2026-03-26 - SincronizaciÃ³n de Resultados y Red Local

- **Archivo:** `backend/routes/api.py`, `frontend/js/pages/exam.js`, `backend/server.py`
- **Error:** Resultados vacÃ­os en frontend y fallo de acceso externo en producciÃ³n.
- **Causa:**
  1. El backend no retornaba el objeto detallado (correctas/incorrectas/revision).
  2. El servidor de producciÃ³n se vinculaba a `127.0.0.1` en lugar de `0.0.0.0`.
- **LecciÃ³n:**
  1. Asegurar contratos de API coherentes entre backend y frontend antes de implementar componentes de UI.
  2. En entornos de red local (IEM), los servidores de producciÃ³n deben escuchar en todas las interfaces para ser accesibles por los estudiantes.
