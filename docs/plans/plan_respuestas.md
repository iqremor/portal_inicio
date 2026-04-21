# 🎯 Plan RESPUESTA-MASTER: Gestión Administrativa de Claves

**Estado:** `[BORRADOR]`
**Fecha de Creación:** 20 de abril de 2026
**Objetivo Principal:** Centralizar la gestión de las respuestas correctas de los cuadernillos mediante una interfaz administrativa y carga masiva desde Excel, eliminando la dependencia del archivo estático `respuestas.json`.

---

## 📋 Fases del Plan

### Fase 1: Estructura de Datos (Base de Datos) [PENDIENTE]

Migrar la lógica de almacenamiento de respuestas del archivo JSON a una tabla relacional para permitir edición granular.

- **Modelo `CuadernilloRespuesta`**:
  - `id`: Identificador único.
  - `cuadernillo_id`: Relación con la tabla `Cuadernillo`.
  - `pregunta_numero`: Índice de la pregunta (1-N).
  - `respuesta_correcta`: Letra de la opción (A, B, C, D, etc.).
- **Script de Migración**: Desarrollar un script para importar los datos actuales de `backend/data/respuestas.json` a la nueva tabla.

### Fase 2: Interfaz Administrativa (Panel Admin) [PENDIENTE]

Crear una nueva vista en Flask-Admin para gestionar las claves de forma visual.

- **Vista de Lista**: Filtrable por Cuadernillo y Área.
- **Edición Directa**: Permitir corregir una letra de respuesta sin salir de la lista (Editable List).
- **Validación de Datos**: Restringir las entradas a letras permitidas (A-H) según el Plan VARIA.

### Fase 3: Carga Masiva desde Excel [PENDIENTE]

Implementar una herramienta de importación masiva.

- **Plantilla de Carga**: Generar un archivo Excel con el ID del cuadernillo y columnas para las respuestas.
- **Procesamiento**: Lógica para validar el formato, detectar el cuadernillo y actualizar/insertar los registros de respuestas de forma atómica.

### Fase 4: Refactorización del Motor de Calificación [PENDIENTE]

Actualizar los endpoints del API para que consuman la base de datos.

- **`backend/routes/api.py`**: Modificar `get_exam_questions_by_session` y `finalizar_examen` para consultar la tabla `CuadernilloRespuesta`.
- **Optimización**: Implementar caché para evitar consultas excesivas a la DB durante el examen.

---

## 🛠️ Especificaciones Técnicas

### Modelo Sugerido (SQLAlchemy)

```python
class CuadernilloRespuesta(db.Model):
    __tablename__ = 'cuadernillo_respuestas'
    id = db.Column(db.Integer, primary_key=True)
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey('cuadernillo.id'), nullable=False)
    pregunta_numero = db.Column(db.Integer, nullable=False)
    respuesta_correcta = db.Column(db.String(1), nullable=False)

    # Relación para facilitar consultas
    cuadernillo = db.relationship('Cuadernillo', backref=db.backref('respuestas_clave', lazy=True))
```

---

## 📝 Notas de Seguimiento

- _Sesión 40_: Creación del plan inicial por solicitud del administrador para mejorar la autonomía en la gestión de contenidos.
