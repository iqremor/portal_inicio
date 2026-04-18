import { checkSession, handleLogout } from '../shared/auth.js';
import { getInitials } from '../shared/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = checkSession();
  if (!session || !session.active) {
    window.location.href = 'login.html';
    return;
  }

  // 1. Iniciar observación del Header (para datos de usuario y logout)
  initHeaderObserver(session);

  // 2. Mostrar datos de Bienvenida (disponibles de inmediato)
  const welcomeName = document.getElementById('student-name-welcome');
  if (welcomeName && session.nombre_completo) {
    welcomeName.textContent = session.nombre_completo.toUpperCase();
  }

  // 3. Cargar Áreas y Puntajes
  await loadLobbyData(session);
});

/**
 * Observa el DOM para detectar cuándo se inyecta el header y poblarlo.
 */
function initHeaderObserver(session) {
  const populate = () => {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');
    const btnLogout = document.querySelector('.main-header__logout-btn');

    if (userAvatar && session.nombre_completo) {
      userAvatar.textContent = getInitials(session.nombre_completo);
    }
    if (userName && session.nombre_completo) {
      userName.textContent = session.nombre_completo;
    }
    if (userGrade && session.grado) {
      userGrade.textContent = session.grado;
    }

    if (btnLogout) {
      // Eliminar listeners previos para evitar duplicados
      const newBtnLogout = btnLogout.cloneNode(true);
      btnLogout.parentNode.replaceChild(newBtnLogout, btnLogout);
      newBtnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout(session);
      });
      return true; // Éxito
    }
    return false;
  };

  // 1. Intento inmediato
  if (populate()) return;

  // 2. Observar cambios en el placeholder del header
  const target = document.getElementById('header-placeholder');
  if (target) {
    const observer = new MutationObserver(() => {
      if (populate()) {
        observer.disconnect(); // Dejar de observar una vez poblado
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  // 3. Fallback: Escuchar el evento personalizado por si acaso
  window.addEventListener('fragmentsLoaded', populate);
}

async function loadLobbyData(session) {
  const areasContainer = document.getElementById('areas-container');
  const scoresContainer = document.getElementById('scores-container');

  try {
    const studentGrade = session.grado;
    const response = await fetch(`/api/examenes/grado/${studentGrade}`, {
      headers: { 'X-Session-ID': session.sessionId || session.session_id },
    });
    const allExams = await response.json();

    // Filtrar exámenes de categoría SABER (ignorar UNAL y LABORATORIOS)
    const saberExams = allExams.filter((exam) =>
      exam.cuadernillo_id.toLowerCase().includes('pruebas_saber')
    );

    const resResults = await fetch(
      `/api/usuario/${session.codigo}/resumen_notas`,
      {
        headers: { 'X-Session-ID': session.sessionId || session.session_id },
      }
    );

    let bestScoresMap = {};
    if (resResults.ok) {
      bestScoresMap = await resResults.json();
    }

    renderAreas(saberExams, areasContainer, session);
    renderScores(saberExams, bestScoresMap, scoresContainer);
  } catch (error) {
    console.error('Error cargando datos del lobby Prueba Saber:', error);
    if (areasContainer) {
      areasContainer.innerHTML =
        '<p class="error-msg">Error al cargar los componentes. Intente de nuevo.</p>';
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
  const sortedExams = [...exams].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
  sortedExams.forEach((exam) => {
    const btn = document.createElement('button');
    btn.className = 'area-button';
    let displayName = exam.nombre
      .replace('Cuadernillo de ', '')
      .split(' - Grado')[0];
    btn.innerHTML = `
            <span class="btn-label">${displayName}</span>
            <span class="area-info">${exam.tiempo_limite_minutos} min</span>
        `;
    btn.addEventListener('click', () => startExam(exam.id, exam.area, session));
    container.appendChild(btn);
  });
}

function renderScores(exams, bestScoresMap, container) {
  if (!container) return;
  container.innerHTML = '';
  const sortedExams = [...exams].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
  sortedExams.forEach((exam) => {
    const bestScore = bestScoresMap[exam.area] || 0.0;
    const scoreItem = document.createElement('div');
    scoreItem.className = 'score-item';
    const isPending = bestScore === 0;
    let displayName = exam.nombre
      .replace('Cuadernillo de ', '')
      .split(' - Grado')[0];
    scoreItem.innerHTML = `
            <span class="area-name">${displayName}</span>
            <span class="score-value ${
              isPending ? 'pending' : ''
            }">${bestScore.toFixed(1)}</span>
        `;
    container.appendChild(scoreItem);
  });
}

async function startExam(cuadernilloId, areaId, session) {
  try {
    const response = await fetch(`/api/examenes/id/${cuadernilloId}/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': session.sessionId || session.session_id,
      },
      body: JSON.stringify({ codigo: session.codigo }),
    });
    const data = await response.json();
    if (response.ok && data.sesion_id) {
      window.location.href = `examen.html?id=${data.sesion_id}&area=${areaId}`;
    } else {
      alert(data.error || 'Error al iniciar el examen');
    }
  } catch (error) {
    console.error('Error al iniciar examen:', error);
    alert('Hubo un problema al conectar con el servidor.');
  }
}
