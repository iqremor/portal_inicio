const API_BASE = window.location.origin;

export async function validateCode(codigo) {
    const response = await fetch(`${API_BASE}/api/validar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo: codigo })
    });
    return response.json();
}

export async function fetchUserData(codigo) {
    const response = await fetch(`${API_BASE}/api/usuario/${codigo}`);
    if (!response.ok) {
        throw new Error('Usuario no encontrado');
    }
    return response.json();
}

export async function loadExamAreas() {
    const response = await fetch(`${API_BASE}/api/examenes`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export async function startExam(areaId, codigo, grado) {
    const response = await fetch(`${API_BASE}/api/examenes/${areaId}/iniciar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo: codigo, grado: grado })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al iniciar el examen');
    }
    return response.json();
}

export async function getExamQuestions(sessionId) {
    const response = await fetch(`${API_BASE}/api/examen/${sessionId}`);
    if (!response.ok) {
        throw new Error('Error al cargar las preguntas del examen');
    }
    return response.json();
}

export async function submitExam(sessionId, answers, userCodigo) {
    const response = await fetch(`${API_BASE}/api/examen/${sessionId}/finalizar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            respuestas: answers,
            codigo: userCodigo // Add userCodigo to the body
        })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al finalizar el examen');
    }
    return response.json();
}

export async function loadRecentResults(codigo) {
    const response = await fetch(`${API_BASE}/api/resultados/${codigo}`);
    if (!response.ok) {
        return [];
    }
    return response.json();
}

export async function logout(codigo) {
    try {
        await fetch(`${API_BASE}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo: codigo })
        });
    } catch (error) {
        console.error('Error during logout:', error);
    }
}
