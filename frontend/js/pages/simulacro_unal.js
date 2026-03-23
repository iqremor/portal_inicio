import { getSession } from '../shared/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // 1. Mostrar nombre de bienvenida
  const welcomeName = document.getElementById('student-name-welcome');
  if (welcomeName && session.nombre_completo) {
    welcomeName.textContent = session.nombre_completo.toUpperCase();
  }

  // 2. Cargar Áreas y Puntajes específicos para Preunal
  await loadLobbyData(session);

  // 3. Manejo de Finalizar Sesión
  const btnSave = document.getElementById('btn-save-session');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});

async function loadLobbyData(session) {
  const areasContainer = document.getElementById('areas-container');
  const scoresContainer = document.getElementById('scores-container');

  try {
    // Consultar exámenes disponibles
    const response = await fetch('/api/examenes', {
      headers: { 'X-Session-ID': session.session_id },
    });
    const allExams = await response.json();

    // Filtrar exámenes por el grado del estudiante y que sean específicos para Preunal
    // Asumimos que los nombres de área o el `tipo` (si se pasara) ayudan a identificar Preunal
    // Por ahora, filtramos por un nombre de área común para Preunal o si el examen está marcado como Preunal
    const studentGrade = session.grado;
    const preunalExams = allExams.filter(
      (exam) =>
        exam.grado.toLowerCase() === studentGrade.toLowerCase() &&
        (exam.nombre.toLowerCase().includes('preunal') ||
          exam.area.toLowerCase().includes('preunal')) // Heurística simple, podría necesitar ajuste
    );

    // Consultar resultados previos del estudiante (MEJORES NOTAS)
    // Usamos el endpoint de resultados por usuario si existe
    const resResults = await fetch(
      `/api/admin/resultados/grado/${studentGrade}/examen/all`,
      {
        headers: { 'X-Session-ID': session.session_id },
      }
    );

    let userResults = [];
    if (resResults.ok) {
      const allResults = await resResults.json();
      // Filtrar resultados que correspondan a los exámenes Preunal
      userResults = allResults.filter(
        (r) =>
          preunalExams.some((exam) => exam.id === r.cuadernillo_id) &&
          r.codigo === session.codigo
      );
    }

    renderAreas(preunalExams, areasContainer, session);
    renderScores(preunalExams, userResults, scoresContainer);
  } catch (error) {
    console.error('Error cargando datos del lobby Preunal:', error);
    if (areasContainer) {
      areasContainer.innerHTML =
        '<p class="error-msg">Error al cargar los componentes Preunal. Intente de nuevo.</p>';
    }
  }
}

function renderAreas(exams, container, session) {
  if (!container) return;
  container.innerHTML = '';

  if (exams.length === 0) {
    container.innerHTML =
      '<p class="info-msg">No hay exámenes Preunal disponibles para tu grado actualmente.</p>';
    return;
  }

  exams.forEach((exam) => {
    const btn = document.createElement('button');
    btn.className = 'area-button';
    btn.innerHTML = `
            <span class="btn-label">${exam.nombre}</span>
            <span class="area-info">${exam.tiempo_limite_minutos} min</span>
        `;

    btn.addEventListener('click', () => startExam(exam.id, exam.area, session)); // Pass exam.id and exam.area
    container.appendChild(btn);
  });
}

function renderScores(exams, results, container) {
  if (!container) return;
  container.innerHTML = '';

  // Mapeo de áreas para asegurar que mostramos todas, incluso con 0.0
  exams.forEach((exam) => {
    // Buscar el mejor resultado para esta área (cuadernillo_id)
    const areaResults = results.filter((r) => r.cuadernillo_id === exam.id);
    const bestScore =
      areaResults.length > 0
        ? Math.max(...areaResults.map((r) => parseFloat(r.nota_final)))
        : 0.0;

    const scoreItem = document.createElement('div');
    scoreItem.className = 'score-item';

    const isPending = bestScore === 0;

    scoreItem.innerHTML = `
            <span class="area-name">${exam.nombre}</span>
            <span class="score-value ${
              isPending ? 'pending' : ''
            }">${bestScore.toFixed(1)}</span>
        `;

    container.appendChild(scoreItem);
  });
}

async function startExam(cuadernilloId, areaId, session) {
  // Added cuadernilloId parameter
  try {
    const response = await fetch(`/api/examenes/${areaId}/iniciar`, {
      // Using areaId here as per API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': session.session_id,
      },
      body: JSON.stringify({
        codigo: session.codigo,
        grado: session.grado,
      }),
    });

    const data = await response.json();

    if (response.ok && data.sesion_id) {
      // Redirigir a la página de examen con el session_id y el areaId
      window.location.href = `examen.html?id=${data.sesion_id}&area=${areaId}`;
    } else {
      alert(data.error || 'Error al iniciar el examen');
    }
  } catch (error) {
    console.error('Error al iniciar examen:', error);
    alert('Hubo un problema al conectar con el servidor.');
  }
}
