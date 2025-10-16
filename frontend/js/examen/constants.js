// Configuración para pruebas cortas y revisión rápida
// export const quizConfig = {
//     timerDuration: 15, // Duración del temporizador en segundos (15 segundos para pruebas)
//     warningTime: 5, // Mostrar advertencia cuando queden 5 segundos.
//     nextButtonDelay: 5000, // 5 segundos
// };

// Configuración para pruebas estándar
export const quizConfig = {
    timerDuration: 240, // Duración del temporizador en segundos (4 minutos)
    warningTime: 30, // Mostrar advertencia cuando queden 30 segundos.
    nextButtonDelay: 180000, // 3 minutos
};

// --- BANCO DE IMÁGENES ---
const TOTAL_IMAGES = 20;

export const imagePaths = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
    const imageNumber = (i + 1).toString().padStart(2, '0');
    return `banco_preguntas/pregunta_${imageNumber}.jpg`;
});

// Datos generales de la prueba
 export const Data = {
     Grado: 7, // Grado de la prueba
     subject: 'Ciencias naturales', // Asignatura
     numQuestions: 10, // Número de preguntas
     numIntentos: 10, // Número de intentos permitidos
};