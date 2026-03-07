import { submitExam, apiFetch } from "../api/index.js"; // Add apiFetch

/**
 * Guarda un intento de quiz en el backend.
 * @param {string} sessionId - El ID de la sesión del examen.
 * @param {Array} answers - Las respuestas del usuario.
 * @param {string} userCodigo - El código del usuario.
 * @returns {Promise<object>} Una promesa que se resuelve con los resultados del examen.
 */
export async function guardarIntento(sessionId, answers, userCodigo) {
  try {
    const resultado = await submitExam(sessionId, answers, userCodigo);
    return resultado;
  } catch (error) {
    console.error("Error al guardar el intento:", error);
    // Re-lanzar el error para que el llamador sepa que algo salió mal.
    throw new Error(error.message || "No se pudo guardar el intento.");
  }
}

/**
 * Obtiene el número de intentos realizados por un usuario para un cuadernillo específico.
 * @param {number} cuadernilloId - El ID del cuadernillo.
 * @returns {Promise<number>} El número de intentos realizados.
 */
export async function obtenerNumeroDeIntentos(cuadernilloId) {
  const response = await apiFetch(
    `/api/examenes/${cuadernilloId}/attempts`,
    {},
    "No se pudo obtener el número de intentos.",
  );
  const data = await response.json();
  return data.current_attempts;
}
