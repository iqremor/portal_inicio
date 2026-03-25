import { getSession } from '../shared/auth.js';
import { getInitials } from '../shared/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // 1. Mostrar datos de usuario (Header y Bienvenida)
  updateUI(session);

  // 2. Cargar Áreas y Puntajes
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

    // Filtrar exámenes por el grado del estudiante
    const studentGrade = session.grado; // Ej: "Once", "Decimo"
    // Filtrar exámenes por el grado del estudiante Y que sean para Preicfes
    const availableExams = allExams.filter(
      (exam) =>
        exam.grado.toLowerCase() === studentGrade.toLowerCase() &&
        (exam.nombre.toLowerCase().includes('preicfes') ||
          exam.area.toLowerCase().includes('preicfes')) // Filtro específico para Preicfes
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
      // Filtrar resultados que correspondan a los exámenes Preicfes
      userResults = allResults.filter(
        (r) =>
          availableExams.some((exam) => exam.id === r.cuadernillo_id) &&
          r.codigo === session.codigo
      );
    }

    renderAreas(availableExams, areasContainer, session);
    renderScores(availableExams, userResults, scoresContainer);
  } catch (error) {
    console.error('Error cargando datos del lobby Preicfes:', error);
    if (areasContainer) {
      areasContainer.innerHTML =
        '<p class="error-msg">Error al cargar los componentes Preicfes. Intente de nuevo.</p>';
    }
  }
}

function renderAreas(exams, container, session) {
  if (!container) return;
  container.innerHTML = '';

  if (exams.length === 0) {
    container.innerHTML =
      '<p class="info-msg">No hay exámenes disponibles para tu grado actualmente.</p>';
    return;
  }

  exams.forEach((exam) => {
    const btn = document.createElement('button');
    btn.className = 'area-button';
    btn.innerHTML = `
            <span class="btn-label">${exam.nombre}</span>
            <span class="area-info">${exam.tiempo_limite_minutos} min</span>
        `;

    btn.addEventListener('click', () => startExam(exam.area, session));
    container.appendChild(btn);
  });
}

function renderScores(exams, results, container) {
  if (!container) return;
  container.innerHTML = '';

  // Mapeo de áreas para asegurar que mostramos todas, incluso con 0.0
  exams.forEach((exam) => {
    // Buscar el mejor resultado para esta área
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

async function startExam(areaId, session) {
  try {
    const response = await fetch(`/api/examenes/${areaId}/iniciar`, {
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
      // Redirigir a la página de examen con el session_id
      window.location.href = `examen.html?session_id=${data.sesion_id}`;
    } else {
      alert(data.error || 'Error al iniciar el examen');
    }
  } catch (error) {
    console.error('Error al iniciar examen:', error);
    alert('Hubo un problema al conectar con el servidor.');
  }
}

function updateUI(session) {
  // Datos de Bienvenida
  const welcomeName = document.getElementById('student-name-welcome');
  if (welcomeName && session.nombre_completo) {
    welcomeName.textContent = session.nombre_completo.toUpperCase();
  }

  // Como el header se carga por fragmento (fetch), puede que no esté listo de inmediato
  setTimeout(() => {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');

    if (userAvatar && session.nombre_completo) {
      userAvatar.textContent = getInitials(session.nombre_completo);
    }
    if (userName && session.nombre_completo) {
      userName.textContent = session.nombre_completo;
    }
    if (userGrade && session.grado) {
      userGrade.textContent = session.grado;
    }
  }, 300);
}
