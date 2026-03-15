document.addEventListener('DOMContentLoaded', function () {
  const serverStatusDiv = document.getElementById('server-status');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const restartBtn = document.getElementById('restart-btn');
  const messageBox = document.getElementById('message-box');
  const activeSessionsTableBody = document.querySelector(
    '#active-sessions-table tbody'
  );
  const noSessionsMessage = document.getElementById('no-sessions-message');

  function updateServerStatus(status) {
    serverStatusDiv.textContent = `Estado del Servidor: ${
      status === 'running' ? 'En Ejecución' : 'Detenido'
    }`;
    serverStatusDiv.className = `status-box ${
      status === 'running' ? 'status-running' : 'status-stopped'
    }`;
  }

  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = 'block';
    setTimeout(() => {
      messageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
  }

  async function fetchServerStatus() {
    try {
      const response = await fetch('/server-admin/status');
      const data = await response.json();
      updateServerStatus(data.status);
    } catch (error) {
      console.error('Error fetching server status:', error);
      showMessage('Error al obtener el estado del servidor.', 'error');
    }
  }

  async function sendServerCommand(command) {
    try {
      const response = await fetch(`/server-admin/${command}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showMessage(data.message, 'success');
        // Give a small delay before fetching status to allow server state to update
        setTimeout(fetchServerStatus, 1000);
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error(`Error sending ${command} command:`, error);
      showMessage(`Error al ejecutar el comando '${command}'.`, 'error');
    }
  }

  async function fetchActiveSessions() {
    try {
      const response = await fetch('/server-admin/active_sessions');
      const data = await response.json();
      renderActiveSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      showMessage('Error al obtener las sesiones activas.', 'error');
      renderActiveSessions([]); // Render empty to clear old data
    }
  }

  function renderActiveSessions(sessions) {
    activeSessionsTableBody.innerHTML = ''; // Clear existing sessions
    if (sessions.length === 0) {
      noSessionsMessage.style.display = 'block';
      activeSessionsTableBody.style.display = 'none';
    } else {
      noSessionsMessage.style.display = 'none';
      activeSessionsTableBody.style.display = 'table-row-group'; // Show table body
      sessions.forEach((session) => {
        const row = activeSessionsTableBody.insertRow();
        row.innerHTML = `
                    <td>${session.user_id}</td>
                    <td>${session.username}</td>
                    <td>${new Date(session.login_time).toLocaleString()}</td>
                    <td>${new Date(session.last_seen).toLocaleString()}</td>
                    <td>${session.ip_address || 'N/A'}</td>
                    <td>${session.user_agent || 'N/A'}</td>
                    <td><button class="btn-logout-session" data-user-id="${
                      session.user_id
                    }">Cerrar Sesión</button></td>
                `;
      });
      attachLogoutEventListeners();
    }
  }

  function attachLogoutEventListeners() {
    document.querySelectorAll('.btn-logout-session').forEach((button) => {
      button.removeEventListener('click', handleLogoutClick); // Prevent duplicate listeners
      button.addEventListener('click', handleLogoutClick);
    });
  }

  async function handleLogoutClick(event) {
    const userId = event.target.dataset.userId;
    if (
      confirm(
        `¿Está seguro de que desea cerrar todas las sesiones del usuario con ID ${userId}?`
      )
    ) {
      try {
        const response = await fetch(`/server-admin/logout_user/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          showMessage(data.message, 'success');
          fetchActiveSessions(); // Refresh sessions list
        } else {
          showMessage(data.message, 'error');
        }
      } catch (error) {
        console.error(
          `Error al cerrar la sesión del usuario ${userId}:`,
          error
        );
        showMessage(
          `Error al cerrar la sesión del usuario ${userId}.`,
          'error'
        );
      }
    }
  }

  // --- Gestión de Intentos ---
  const gradeSelect = document.getElementById('grade-select');
  const studentSelectContainer = document.getElementById(
    'student-select-container'
  );
  const studentSelect = document.getElementById('student-select');
  const userResultsContainer = document.getElementById(
    'user-results-container'
  );
  const userResultsTableBody = document.querySelector(
    '#user-results-table tbody'
  );

  gradeSelect.addEventListener('change', async function () {
    const grado = this.value;
    if (!grado) {
      studentSelectContainer.style.display = 'none';
      userResultsContainer.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`/server-admin/users_by_grade/${grado}`);
      const data = await response.json();
      if (data.success) {
        renderStudentSelect(data.users);
        studentSelectContainer.style.display = 'block';
        userResultsContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      showMessage('Error al cargar la lista de estudiantes.', 'error');
    }
  });

  function renderStudentSelect(users) {
    studentSelect.innerHTML =
      '<option value="">Seleccione un estudiante</option>';
    users.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.codigo} - ${u.nombre_completo}`;
      studentSelect.appendChild(opt);
    });
  }

  studentSelect.addEventListener('change', async function () {
    const userId = this.value;
    if (!userId) {
      userResultsContainer.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`/server-admin/user_results/${userId}`);
      const data = await response.json();
      if (data.success) {
        renderUserResults(data.results, userId);
        userResultsContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      showMessage('Error al cargar los resultados del estudiante.', 'error');
    }
  });

  function renderUserResults(results, userId) {
    userResultsTableBody.innerHTML = '';
    if (results.length === 0) {
      userResultsTableBody.innerHTML =
        "<tr><td colspan='4'>No hay exámenes realizados.</td></tr>";
      return;
    }

    // Agrupar resultados por cuadernillo para mostrar el último estado
    const latestResults = {};
    results.forEach((r) => {
      if (
        !latestResults[r.cuadernillo_id] ||
        r.attempt_number > latestResults[r.cuadernillo_id].attempt_number
      ) {
        latestResults[r.cuadernillo_id] = r;
      }
    });

    Object.values(latestResults).forEach((r) => {
      const row = userResultsTableBody.insertRow();
      row.innerHTML = `
                <td>${r.area}</td>
                <td>${r.final_score.toFixed(2)} / 5.0</td>
                <td>Intento ${r.attempt_number}</td>
                <td><button class="btn-reset-attempts" data-user-id="${userId}" data-cuadernillo-id="${
                  r.cuadernillo_id
                }">Reactivar Intentos</button></td>
            `;
    });

    attachResetEventListeners();
  }

  function attachResetEventListeners() {
    document.querySelectorAll('.btn-reset-attempts').forEach((button) => {
      button.addEventListener('click', handleResetClick);
    });
  }

  async function handleResetClick(event) {
    const userId = event.target.dataset.userId;
    const cuadernilloId = event.target.dataset.cuadernilloId;

    if (
      confirm(
        '¿Está seguro de que desea ELIMINAR todos los intentos de este estudiante para esta materia? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        const response = await fetch('/server-admin/reset_exam_attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            cuadernillo_id: cuadernilloId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          showMessage(data.message, 'success');
          // Simular cambio en studentSelect para refrescar la tabla
          studentSelect.dispatchEvent(new Event('change'));
        } else {
          showMessage(data.message, 'error');
        }
      } catch (error) {
        console.error('Error al resetear intentos:', error);
        showMessage('Error al procesar la solicitud de reactivación.', 'error');
      }
    }
  }

  startBtn.addEventListener('click', () => sendServerCommand('start'));
  stopBtn.addEventListener('click', () => sendServerCommand('stop'));
  restartBtn.addEventListener('click', () => sendServerCommand('restart'));

  // Initial status fetch
  fetchServerStatus();
  // Fetch status every 5 seconds
  setInterval(fetchServerStatus, 5000);

  // Initial fetch for active sessions
  fetchActiveSessions();
  // Fetch active sessions every 10 seconds
  setInterval(fetchActiveSessions, 10000);
});
