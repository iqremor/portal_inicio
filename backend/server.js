const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// Rutas de archivos de datos
const DATA_DIR = path.join(__dirname, '../data');
const USUARIOS_FILE = path.join(DATA_DIR, 'usuarios.json');
const EXAMENES_FILE = path.join(DATA_DIR, 'examenes.json');
const RESULTADOS_FILE = path.join(DATA_DIR, 'resultados.json');
const CONFIG_FILE = path.join(DATA_DIR, 'configuracion.json');

// Funciones auxiliares para manejo de archivos
async function leerArchivo(archivo) {
  try {
    const data = await fs.readFile(archivo, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo archivo ${archivo}:`, error);
    return null;
  }
}

async function escribirArchivo(archivo, data) {
  try {
    await fs.writeFile(archivo, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error escribiendo archivo ${archivo}:`, error);
    return false;
  }
}

// Middleware de validación de código estudiantil
function validarCodigoEstudiantil(codigo) {
  const regex = /^IEM\d{4}$/;
  return regex.test(codigo);
}

// Middleware de autenticación
async function verificarUsuario(req, res, next) {
  const { codigo } = req.body || req.query;
  
  if (!codigo) {
    return res.status(400).json({
      error: true,
      mensaje: 'Código estudiantil requerido'
    });
  }

  if (!validarCodigoEstudiantil(codigo)) {
    return res.status(400).json({
      error: true,
      mensaje: 'Formato de código inválido'
    });
  }

  const usuarios = await leerArchivo(USUARIOS_FILE);
  if (!usuarios || !usuarios.usuarios_permitidos.includes(codigo)) {
    return res.status(401).json({
      error: true,
      mensaje: 'Código no permitido'
    });
  }

  const datosUsuario = usuarios.nombres[codigo];
  if (!datosUsuario || !datosUsuario.activo) {
    return res.status(401).json({
      error: true,
      mensaje: 'Usuario inactivo'
    });
  }

  req.usuario = {
    codigo,
    ...datosUsuario
  };
  
  next();
}

// RUTAS DE AUTENTICACIÓN

// Validar código estudiantil
app.post('/api/validar', async (req, res) => {
  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({
        permitido: false,
        mensaje: 'Código estudiantil requerido',
        nombre: null
      });
    }

    if (!validarCodigoEstudiantil(codigo)) {
      return res.status(400).json({
        permitido: false,
        mensaje: 'El código estudiantil debe empezar por IEM y tener 4 números',
        nombre: null
      });
    }

    const usuarios = await leerArchivo(USUARIOS_FILE);
    if (!usuarios) {
      return res.status(500).json({
        permitido: false,
        mensaje: 'Error del servidor',
        nombre: null
      });
    }

    if (usuarios.usuarios_permitidos.includes(codigo)) {
      const datosUsuario = usuarios.nombres[codigo];
      if (datosUsuario && datosUsuario.activo) {
        return res.json({
          permitido: true,
          mensaje: 'Código permitido',
          nombre: datosUsuario.nombre_completo,
          grado: datosUsuario.grado
        });
      }
    }

    return res.status(401).json({
      permitido: false,
      mensaje: 'Código no permitido',
      nombre: null
    });

  } catch (error) {
    console.error('Error en validación:', error);
    res.status(500).json({
      permitido: false,
      mensaje: 'Error del servidor',
      nombre: null
    });
  }
});

// Cerrar sesión
app.post('/api/logout', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Sesión cerrada correctamente'
  });
});

// Obtener datos del usuario por código
app.get('/api/usuario/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        error: true,
        mensaje: 'Código estudiantil requerido'
      });
    }

    const usuarios = await leerArchivo(USUARIOS_FILE);
    if (!usuarios) {
      return res.status(500).json({
        error: true,
        mensaje: 'Error del servidor'
      });
    }

    if (usuarios.usuarios_permitidos.includes(codigo)) {
      const datosUsuario = usuarios.nombres[codigo];
      if (datosUsuario && datosUsuario.activo) {
        return res.json({
          codigo: codigo,
          nombre_completo: datosUsuario.nombre_completo,
          grado: datosUsuario.grado,
          activo: datosUsuario.activo
        });
      }
    }

    return res.status(404).json({
      error: true,
      mensaje: 'Usuario no encontrado'
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// RUTAS DE EXÁMENES

// Listar áreas de examen disponibles
app.get('/api/examenes', async (req, res) => {
  try {
    const examenes = await leerArchivo(EXAMENES_FILE);
    if (!examenes) {
      return res.status(500).json({
        error: true,
        mensaje: 'Error cargando exámenes'
      });
    }

    const areas = Object.keys(examenes).map(area => ({
      id: area,
      nombre: examenes[area].nombre,
      descripcion: examenes[area].descripcion,
      tiempo_limite: examenes[area].tiempo_limite,
      total_preguntas: examenes[area].numero_preguntas,
      icono: examenes[area].icono || 'fas fa-book',
      activo: examenes[area].activo
    })).filter(area => area.activo);

    res.json(areas);

  } catch (error) {
    console.error('Error obteniendo exámenes:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Obtener información de un examen específico
app.get('/api/examenes/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const examenes = await leerArchivo(EXAMENES_FILE);
    
    if (!examenes || !examenes[area]) {
      return res.status(404).json({
        error: true,
        mensaje: 'Área de examen no encontrada'
      });
    }

    const examen = examenes[area];
    if (!examen.activo) {
      return res.status(403).json({
        error: true,
        mensaje: 'Examen no disponible'
      });
    }

    res.json({
      success: true,
      examen: {
        nombre: examen.nombre,
        descripcion: examen.descripcion,
        tiempo_limite: examen.tiempo_limite,
        numero_preguntas: examen.numero_preguntas
      }
    });

  } catch (error) {
    console.error('Error obteniendo examen:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Iniciar un examen
app.post('/api/examenes/:area/iniciar', async (req, res) => {
  try {
    const { area } = req.params;
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({
        error: true,
        mensaje: 'Código estudiantil requerido'
      });
    }

    // Verificar usuario
    const usuarios = await leerArchivo(USUARIOS_FILE);
    if (!usuarios || !usuarios.usuarios_permitidos.includes(codigo)) {
      return res.status(401).json({
        error: true,
        mensaje: 'Código no permitido'
      });
    }

    const examenes = await leerArchivo(EXAMENES_FILE);
    if (!examenes || !examenes[area] || !examenes[area].activo) {
      return res.status(404).json({
        error: true,
        mensaje: 'Examen no disponible'
      });
    }

    const examen = examenes[area];
    
    // Mezclar preguntas aleatoriamente
    const preguntasMezcladas = [...examen.preguntas].sort(() => Math.random() - 0.5);
    
    // Tomar solo el número de preguntas especificado
    const preguntasSeleccionadas = preguntasMezcladas.slice(0, examen.numero_preguntas);
    
    // Remover respuestas correctas del envío al frontend
    const preguntasParaEnvio = preguntasSeleccionadas.map(pregunta => ({
      id: pregunta.id,
      tipo: pregunta.tipo,
      pregunta: pregunta.pregunta,
      opciones: pregunta.opciones,
      imagen: pregunta.imagen || null,
      puntos: pregunta.puntos
    }));

    const sesionExamen = {
      id: uuidv4(),
      codigo_estudiante: codigo,
      area,
      fecha_inicio: moment().toISOString(),
      tiempo_limite: examen.tiempo_limite,
      preguntas: preguntasSeleccionadas,
      respuestas: new Array(preguntasSeleccionadas.length).fill(null),
      estado: 'en_progreso'
    };

    // Guardar sesión en memoria (en producción usar base de datos)
    if (!global.sesionesExamen) {
      global.sesionesExamen = {};
    }
    global.sesionesExamen[sesionExamen.id] = sesionExamen;

    res.json({
      success: true,
      sesion_id: sesionExamen.id,
      examen: {
        nombre: examen.nombre,
        tiempo_limite: examen.tiempo_limite,
        preguntas: preguntasParaEnvio
      }
    });

  } catch (error) {
    console.error('Error iniciando examen:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Responder una pregunta
app.post('/api/examenes/:area/responder', async (req, res) => {
  try {
    const { sesion_id, pregunta_id, respuesta } = req.body;

    if (!global.sesionesExamen || !global.sesionesExamen[sesion_id]) {
      return res.status(404).json({
        error: true,
        mensaje: 'Sesión de examen no encontrada'
      });
    }

    const sesion = global.sesionesExamen[sesion_id];
    
    if (sesion.estado !== 'en_progreso') {
      return res.status(400).json({
        error: true,
        mensaje: 'Examen ya finalizado'
      });
    }

    // Verificar tiempo límite
    const tiempoTranscurrido = moment().diff(moment(sesion.fecha_inicio), 'minutes');
    if (tiempoTranscurrido > sesion.tiempo_limite) {
      sesion.estado = 'tiempo_agotado';
      return res.status(400).json({
        error: true,
        mensaje: 'Tiempo agotado'
      });
    }

    // Encontrar índice de la pregunta
    const indicePregunta = sesion.preguntas.findIndex(p => p.id === pregunta_id);
    if (indicePregunta === -1) {
      return res.status(404).json({
        error: true,
        mensaje: 'Pregunta no encontrada'
      });
    }

    // Guardar respuesta
    sesion.respuestas[indicePregunta] = respuesta;

    res.json({
      success: true,
      mensaje: 'Respuesta guardada'
    });

  } catch (error) {
    console.error('Error guardando respuesta:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Finalizar examen
app.post('/api/examenes/:area/finalizar', async (req, res) => {
  try {
    const { sesion_id } = req.body;

    if (!global.sesionesExamen || !global.sesionesExamen[sesion_id]) {
      return res.status(404).json({
        error: true,
        mensaje: 'Sesión de examen no encontrada'
      });
    }

    const sesion = global.sesionesExamen[sesion_id];
    
    if (sesion.estado === 'completado') {
      return res.status(400).json({
        error: true,
        mensaje: 'Examen ya finalizado'
      });
    }

    // Calcular puntuación
    let puntuacion = 0;
    let puntuacionMaxima = 0;
    let preguntasCorrectas = 0;

    sesion.preguntas.forEach((pregunta, index) => {
      puntuacionMaxima += pregunta.puntos;
      const respuestaEstudiante = sesion.respuestas[index];
      
      if (respuestaEstudiante === pregunta.respuesta_correcta) {
        puntuacion += pregunta.puntos;
        preguntasCorrectas++;
      }
    });

    const porcentaje = Math.round((puntuacion / puntuacionMaxima) * 100);
    const tiempoUsado = moment().diff(moment(sesion.fecha_inicio), 'minutes');

    // Crear resultado
    const resultado = {
      id: uuidv4(),
      fecha: moment().toISOString(),
      area: sesion.area,
      puntuacion,
      puntuacion_maxima: puntuacionMaxima,
      porcentaje,
      tiempo_usado: tiempoUsado,
      tiempo_limite: sesion.tiempo_limite,
      respuestas: sesion.respuestas,
      preguntas_respondidas: sesion.respuestas.filter(r => r !== null).length,
      preguntas_correctas: preguntasCorrectas,
      estado: 'completado'
    };

    // Guardar resultado
    const resultados = await leerArchivo(RESULTADOS_FILE) || {};
    if (!resultados[sesion.codigo_estudiante]) {
      resultados[sesion.codigo_estudiante] = [];
    }
    resultados[sesion.codigo_estudiante].push(resultado);
    
    await escribirArchivo(RESULTADOS_FILE, resultados);

    // Marcar sesión como completada
    sesion.estado = 'completado';
    sesion.resultado = resultado;

    res.json({
      success: true,
      resultado: {
        puntuacion,
        puntuacion_maxima: puntuacionMaxima,
        porcentaje,
        tiempo_usado: tiempoUsado,
        preguntas_correctas: preguntasCorrectas,
        total_preguntas: sesion.preguntas.length
      }
    });

  } catch (error) {
    console.error('Error finalizando examen:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// RUTAS DE RESULTADOS

// Obtener historial de resultados del estudiante
app.get('/api/resultados/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Verificar que el código sea válido
    const usuarios = await leerArchivo(USUARIOS_FILE);
    if (!usuarios || !usuarios.usuarios_permitidos.includes(codigo)) {
      return res.status(404).json({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    }

    const resultados = await leerArchivo(RESULTADOS_FILE) || {};
    const historialEstudiante = resultados[codigo] || [];

    res.json(historialEstudiante.map(resultado => ({
      id: resultado.id,
      fecha: resultado.fecha,
      area: resultado.area,
      porcentaje: resultado.porcentaje,
      estado: resultado.estado
    })));

  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Obtener resultado específico
app.get('/api/resultados/:codigo/:resultado_id', verificarUsuario, async (req, res) => {
  try {
    const { codigo, resultado_id } = req.params;
    
    if (req.usuario.codigo !== codigo) {
      return res.status(403).json({
        error: true,
        mensaje: 'No autorizado'
      });
    }

    const resultados = await leerArchivo(RESULTADOS_FILE) || {};
    const historialEstudiante = resultados[codigo] || [];
    
    const resultado = historialEstudiante.find(r => r.id === resultado_id);
    if (!resultado) {
      return res.status(404).json({
        error: true,
        mensaje: 'Resultado no encontrado'
      });
    }

    res.json({
      success: true,
      resultado
    });

  } catch (error) {
    console.error('Error obteniendo resultado:', error);
    res.status(500).json({
      error: true,
      mensaje: 'Error del servidor'
    });
  }
});

// Ruta principal - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: 'Ruta no encontrada'
  });
});

// Manejo de errores del servidor
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({
    error: true,
    mensaje: 'Error interno del servidor'
  });
});

// Inicializar sesiones en memoria
global.sesionesExamen = {};

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en http://0.0.0.0:${PORT}`);
  console.log(`📚 Portal de Evaluación Académica IEM`);
  console.log(`🕒 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
});

module.exports = app;

