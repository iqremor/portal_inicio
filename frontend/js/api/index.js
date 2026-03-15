const API_BASE = window.location.origin;
import { handleLogout, checkSession } from '../shared/auth.js'; // Import checkSession

/**
 * Generic API fetch wrapper to handle authentication and error responses.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @param {string} errorMessage - Default error message for non-OK responses.
 * @param {boolean} requiresAuth - Whether the request requires authentication. Defaults to true.
 * @returns {Promise<Response>} - The fetch response.
 */
export async function apiFetch(
  url,
  options = {},
  errorMessage = 'Error en la solicitud.',
  requiresAuth = true
) {
  // Inject X-Session-ID header if authentication is required
  if (requiresAuth) {
    const session = checkSession();
    if (session && session.active && session.sessionId) {
      // Check session.active as well
      options.headers = {
        ...options.headers,
        'X-Session-ID': session.sessionId,
      };
    } else {
      // If session is required but not found or not active, act as if unauthorized
      console.warn(
        'Sesión requerida pero no encontrada localmente o inactiva. Redirigiendo a login.'
      );
      handleLogout();
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      console.warn('Sesión no autorizada o terminada. Redirigiendo a login.');
      handleLogout();
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    if (!response.ok) {
      let message = errorMessage;
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error al parsear JSON del servidor.' }));
        message = errorData.message || errorMessage;
      } else {
        const textError = await response.text();
        message = textError || errorMessage;
      }
      const error = new Error(message);
      error.status = response.status; // Guardar el código de estado (ej: 404)
      throw error;
    }

    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// Refactor existing functions to use apiFetch
export async function validateCode(codigo) {
  const response = await apiFetch(
    `${API_BASE}/api/validar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo: codigo }),
    },
    'Error al validar el código.',
    false
  ); // validateCode does NOT require auth
  return response.json();
}

export async function fetchUserData(codigo) {
  // fetchUserData requires auth
  const response = await apiFetch(
    `${API_BASE}/api/usuario/${codigo}`,
    {},
    'Usuario no encontrado.'
  );
  return response.json();
}

export async function loadExamAreas() {
  // loadExamAreas requires auth
  const response = await apiFetch(
    `${API_BASE}/api/examenes`,
    {},
    'Error al cargar las áreas de examen.'
  );
  return response.json();
}

export async function loadExamsForGrade(grade, userCodigo) {
  const response = await apiFetch(
    `${API_BASE}/api/examenes/grado/${grade}?user_codigo=${userCodigo}`,
    {},
    'Error al cargar los exámenes para el grado.'
  );
  return response.json();
}

export async function startExam(areaId, codigo, grado) {
  // startExam requires auth
  const response = await apiFetch(
    `${API_BASE}/api/examenes/${areaId}/iniciar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo: codigo, grado: grado }),
    },
    'Error al iniciar el examen.'
  );
  return response.json();
}

export async function getExamQuestions(sessionId) {
  // getExamQuestions requires auth
  const response = await apiFetch(
    `${API_BASE}/api/examen/${sessionId}`,
    {},
    'Error al cargar las preguntas del examen.'
  );
  return response.json();
}

export async function submitExam(sessionId, answers, userCodigo, tiempoUsado) {
  // submitExam requires auth
  const response = await apiFetch(
    `${API_BASE}/api/examen/${sessionId}/finalizar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: answers,
        codigo: userCodigo,
        tiempo_usado: tiempoUsado,
      }),
    },
    'Error al finalizar el examen.'
  );
  return response.json();
}

export async function loadRecentResults(codigo) {
  // loadRecentResults requires auth
  const response = await apiFetch(
    `${API_BASE}/api/resultados/${codigo}`,
    {},
    'Error al cargar resultados recientes.'
  );
  return response.json();
}

export async function logout(codigo) {
  try {
    // Explicit logout also requires auth to terminate the session on backend
    await apiFetch(
      `${API_BASE}/api/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo: codigo }),
      },
      'Error al intentar cerrar sesión en el servidor.'
    );
  } catch (error) {
    console.error('Error during explicit logout:', error);
  }
}

export async function uploadExamAnswers(formData) {
  // uploadExamAnswers requires auth
  const response = await apiFetch(
    `${API_BASE}/api/upload_exam_answers`,
    {
      method: 'POST',
      body: formData,
    },
    'Error al subir el archivo de respuestas.'
  );
  return response.json();
}
