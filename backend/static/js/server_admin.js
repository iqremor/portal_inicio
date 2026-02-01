document.addEventListener('DOMContentLoaded', function() {
    const serverStatusDiv = document.getElementById('server-status');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const restartBtn = document.getElementById('restart-btn');
    const messageBox = document.getElementById('message-box');
    const activeSessionsTableBody = document.querySelector('#active-sessions-table tbody');
    const noSessionsMessage = document.getElementById('no-sessions-message');

    function updateServerStatus(status) {
        serverStatusDiv.textContent = `Estado del Servidor: ${status === 'running' ? 'En Ejecución' : 'Detenido'}`;
        serverStatusDiv.className = `status-box ${status === 'running' ? 'status-running' : 'status-stopped'}`;
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
                    'Content-Type': 'application/json'
                }
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
            sessions.forEach(session => {
                const row = activeSessionsTableBody.insertRow();
                row.innerHTML = `
                    <td>${session.user_id}</td>
                    <td>${session.username}</td>
                    <td>${new Date(session.login_time).toLocaleString()}</td>
                    <td>${new Date(session.last_seen).toLocaleString()}</td>
                    <td>${session.ip_address || 'N/A'}</td>
                    <td>${session.user_agent || 'N/A'}</td>
                    <td><button class="btn-logout-session" data-user-id="${session.user_id}">Cerrar Sesión</button></td>
                `;
            });
            attachLogoutEventListeners();
        }
    }

    function attachLogoutEventListeners() {
        document.querySelectorAll('.btn-logout-session').forEach(button => {
            button.removeEventListener('click', handleLogoutClick); // Prevent duplicate listeners
            button.addEventListener('click', handleLogoutClick);
        });
    }

    async function handleLogoutClick(event) {
        const userId = event.target.dataset.userId;
        if (confirm(`¿Está seguro de que desea cerrar todas las sesiones del usuario con ID ${userId}?`)) {
            try {
                const response = await fetch(`/server-admin/logout_user/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    showMessage(data.message, 'success');
                    fetchActiveSessions(); // Refresh sessions list
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error(`Error al cerrar la sesión del usuario ${userId}:`, error);
                showMessage(`Error al cerrar la sesión del usuario ${userId}.`, 'error');
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