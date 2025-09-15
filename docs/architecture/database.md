## Arquitectura de la Base de Datos

La aplicación ha migrado de un sistema de almacenamiento basado en archivos JSON a una base de datos relacional **SQLite**. Esta base de datos es gestionada a través del ORM **Flask-SQLAlchemy**, lo que permite una mayor integridad de los datos, escalabilidad y concurrencia.

Los archivos JSON ubicados en `backend/data/` ahora cumplen únicamente el rol de **fuente de datos inicial (seeding)**, utilizados por los scripts `backend/init_db.py` y `backend/seed_db.py` para poblar la base de datos la primera vez que se configura el sistema.

### Modelos de SQLAlchemy

Los siguientes modelos de SQLAlchemy definen el esquema de la base de datos:

#### Modelo `User`

Almacena la información de cada estudiante o usuario que puede acceder al sistema.

```python
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False) # Código único del estudiante (ej: "IEM0601")
    username = db.Column(db.String(80), unique=True, nullable=False) # Nombre de usuario único para el login
    password_hash = db.Column(db.String(255), nullable=False) # Contraseña hasheada
    nombre_completo = db.Column(db.String(150), nullable=True) # Nombre completo del estudiante
    grado = db.Column(db.String(50), nullable=True) # Grado al que pertenece
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False) # Rol en el sistema (USER, ADMIN)
    is_active = db.Column(db.Boolean, default=True) # Indica si el usuario puede iniciar sesión
```
*   **Relación con JSON:** Los datos para este modelo provienen de `backend/data/usuarios.json`.

#### Modelo `Cuadernillo`

Representa cada uno de los exámenes estáticos (basados en imágenes) disponibles en la plataforma.

```python
class Cuadernillo(db.Model):
    __tablename__ = 'cuadernillos'

    id = db.Column(db.Integer, primary_key=True)
    cuadernillo_id = db.Column(db.String(80), unique=True, nullable=False) # ID único del cuadernillo (ej: "mat_6_cuad_01")
    nombre = db.Column(db.String(200), nullable=False) # Nombre del examen que ve el usuario (ej: "Cuadernillo de Matemáticas - Grado 6")
    descripcion = db.Column(db.Text, nullable=True) # Descripción del examen
    activo = db.Column(db.Boolean, default=True) # Indica si el examen está disponible
    grado = db.Column(db.String(50), nullable=False) # Grado para el que está destinado el examen
    area = db.Column(db.String(80), nullable=False) # Área de conocimiento (ej: "matematicas")
    dir_banco = db.Column(db.String(200), nullable=False) # Ruta al directorio que contiene las imágenes de las preguntas
    total_preguntas_banco = db.Column(db.Integer, nullable=False) # Número total de preguntas en el directorio
```
*   **Relación con JSON:** Los datos para este modelo se construyen a partir de la combinación de `backend/data/examenes.json` y `backend/data/cuadernillos.json`.

### Relación entre los Datos y Flujo de Información

1.  **`usuarios.json` -> Tabla `users`**:
    *   El script `seed_db.py` lee el array de usuarios en `usuarios.json`.
    *   Por cada usuario en el JSON, crea una nueva fila en la tabla `users` de la base de datos.

2.  **`examenes.json` + `cuadernillos.json` -> Tabla `cuadernillos`**:
    *   El flujo de datos para los exámenes estáticos es el siguiente:
        1.  `examenes.json` define los exámenes que se mostrarán al usuario. Cada examen tiene un `cuadernillo_id` que actúa como **clave foránea conceptual**.
        2.  `cuadernillos.json` define las propiedades de cada cuadernillo, como la ruta a las imágenes (`dir_banco`).
        3.  El script `seed_db.py` lee `examenes.json`, y por cada examen, usa el `cuadernillo_id` para buscar la información correspondiente en `cuadernillos.json`.
        4.  Con la información combinada de ambos archivos, se crea una nueva fila en la tabla `cuadernillos` de la base de datos.

Este modelo centraliza la lógica en la base de datos, permitiendo que la aplicación consulte directamente las tablas `users` y `cuadernillos` para obtener la información que necesita, en lugar de leer y procesar múltiples archivos JSON en cada petición.