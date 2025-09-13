## Base de Datos

### Estructura de Usuarios (usuarios.json)
```json
{
  "usuarios_permitidos": ["IEM1001", "IEM1002", "IEM1003"],
  "nombres": {
    "IEM1001": {
      "nombre_completo": "Ana María García",
      "grado": "9A",
      "activo": true
    }
  }
}
```

### Estructura de Exámenes (examenes.json)
```json
{
  "matematicas": {
    "nombre": "Matemáticas",
    "descripcion": "Evaluación de conceptos matemáticos",
    "tiempo_limite": 30,
    "numero_preguntas": 10,
    "activo": true,
    "preguntas": [
      {
        "id": 1,
        "tipo": "multiple_choice",
        "pregunta": "¿Cuál es el resultado de 2+2?",
        "opciones": ["3", "4", "5", "6"],
        "respuesta_correcta": 1,
        "puntos": 2
      }
    ]
  }
}
```

### Estructura de Resultados (resultados.json)
```json
{
  "IEM1001": [
    {
      "id": "uuid-resultado",
      "fecha": "2025-08-15T10:30:00Z",
      "area": "matematicas",
      "puntuacion": 18,
      "puntuacion_maxima": 20,
      "porcentaje": 90,
      "tiempo_usado": 25,
      "estado": "completado"
    }
  ]
}
```
