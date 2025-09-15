## Solución de Problemas

### `flask` command not found
- Asegúrate de haber activado el entorno virtual (`source venv/bin/activate`).
- Confirma que Flask se instaló correctamente con `pip list`.

### Error de base de datos (e.g., `table not found`)
- Asegúrate de haber ejecutado `python backend/init_db.py` al menos una vez después de instalar las dependencias.
- Si has modificado los modelos en `backend/models.py` o necesitas un reinicio completo, puedes ejecutar `python backend/clean_db.py` para eliminar la base de datos existente, y luego volver a ejecutar `python backend/init_db.py` y `python backend/seed_db.py`.

### Problemas de CORS
- El backend está configurado para aceptar peticiones desde cualquier origen (`*`). Si tienes problemas, revisa la consola del navegador para mensajes de error específicos de CORS.
