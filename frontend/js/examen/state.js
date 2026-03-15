export const state = {
  imageList: [], // URLs de las imágenes de las preguntas
  presentedQuestions: [], // Detalles de las preguntas presentadas al usuario
  userAnswers: [], // Respuestas del usuario para cada pregunta
  indicePreguntaActual: 0,
  temporizadorIntervalo: null,
  isAnimationPlaying: false,
  attemptCount: 0,
  intentoAnulado: false,
  sessionId: null,
  userCodigo: null,
  examData: null, // Para almacenar la estructura completa del examen
  tiempoRestanteActual: 0, // Tiempo actual en el cronómetro (incluye sobrante)
  tiempoTotalConsumido: 0, // Segundos totales gastados en el examen
  sobrantePreguntaAnterior: 0, // Segundos que sobraron de la pregunta previa
};
