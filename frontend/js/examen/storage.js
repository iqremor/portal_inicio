import { submitExam } from '../api/index.js';

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
        throw new Error(error.message || 'No se pudo guardar el intento.');
    }
}

/**
 * Obtiene el número de intentos para un examen específico desde el backend.
 * @param {string} sessionId - El ID de la sesión del examen.
 * @param {string} areaId - El ID del área del examen.
 * @returns {Promise<number>} El número de intentos realizados.
 */
export async function obtenerNumeroDeIntentos(sessionId, areaId) {
    // NOTA: La ruta de la API es un ejemplo y la crearemos en el backend más adelante.
    const response = await fetch(`/api/examenes/attempts?sessionId=${sessionId}&areaId=${areaId}`, {
        headers: {
            // En el futuro, aquí se incluirá el token de autenticación JWT
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo obtener el número de intentos.');
    }

    const data = await response.json();
    return data.attemptCount;
}
