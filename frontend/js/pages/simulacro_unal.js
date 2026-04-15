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

    // Filtrar exámenes por el grado del estudiante y que sean específicos para Preunal
    const studentGrade = session.grado;
    const preunalExams = allExams.filter(
      (exam) =>
        exam.grado.toString().toLowerCase() === studentGrade.toLowerCase() &&
        (exam.nombre.toLowerCase().includes('preunal') ||
          exam.area.toLowerCase().includes('preunal'))
    );

    // Consultar mejores notas del estudiante usando el nuevo endpoint de resumen
    const resResults = await fetch(
      `/api/usuario/${session.codigo}/resumen_notas`,
      {
        headers: { 'X-Session-ID': session.session_id },
      }
    );

    let bestScoresMap = {};
    if (resResults.ok) {
      bestScoresMap = await resResults.json();
    }

    renderAreas(preunalExams, areasContainer, session);
    renderScores(preunalExams, bestScoresMap, scoresContainer);
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

    btn.addEventListener('click', () => startExam(exam.id, exam.area, session));
    container.appendChild(btn);
  });
}

function renderScores(exams, bestScoresMap, container) {
  if (!container) return;
  container.innerHTML = '';

  exams.forEach((exam) => {
    const bestScore = bestScoresMap[exam.area] || 0.0;
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

function updateUI(session) {
  // Datos de Bienvenida (Siempre disponibles en el DOM principal)
  const welcomeName = document.getElementById('student-name-welcome');
  if (welcomeName && session.nombre_completo) {
    welcomeName.textContent = session.nombre_completo.toUpperCase();
  }

  // Función interna para poblar el header
  const populateHeader = () => {
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
  };

  // Si el header ya está cargado, lo poblamos de inmediato
  if (document.getElementById('userAvatar')) {
    populateHeader();
  } else {
    // Si no, esperamos al evento de carga de fragmentos
    window.addEventListener('fragmentsLoaded', populateHeader);
  }
}
