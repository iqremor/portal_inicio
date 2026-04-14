// Configuración para pruebas cortas y revisión rápida
// export const quizConfig = {
//     timerDuration: 15, // Duración del temporizador en segundos (15 segundos para pruebas)
//     warningTime: 5, // Mostrar advertencia cuando queden 5 segundos.
//     nextButtonDelay: 5000, // 5 segundos
// };

// Configuración para pruebas estándar
export let quizConfig = {
  timerDuration: 240, // Duración del temporizador en segundos (4 minutos)
  warningTime: 30, // Mostrar advertencia cuando queden 30 segundos.
  nextButtonDelay: 0, // Por defecto 0, sobrescrito dinámicamente
  numAttempts: 1, // Número de intentos permitidos (fallback de seguridad, sobrescrito por el panel admin)
};
