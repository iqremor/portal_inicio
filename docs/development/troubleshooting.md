## Solución de Problemas

### `flask` command not found
- Asegúrate de haber activado el entorno virtual (`source venv/bin/activate`).
- Confirma que Flask se instaló correctamente con `pip list`.

### Error de base de datos (e.g., `table not found`)
- Asegúrate de haber ejecutado `flask init-db` al menos una vez después de instalar las dependencias.
- Si has modificado los modelos en `backend/app.py`, necesitas volver a ejecutar `flask init-db`.

### Problemas de CORS
- El backend está configurado para aceptar peticiones desde cualquier origen (`*`). Si tienes problemas, revisa la consola del navegador para mensajes de error específicos de CORS.
