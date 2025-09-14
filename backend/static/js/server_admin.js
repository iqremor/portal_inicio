document.addEventListener('DOMContentLoaded', function() {
    const serverStatusDiv = document.getElementById('server-status');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const restartBtn = document.getElementById('restart-btn');
    const messageBox = document.getElementById('message-box');

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

    startBtn.addEventListener('click', () => sendServerCommand('start'));
    stopBtn.addEventListener('click', () => sendServerCommand('stop'));
    restartBtn.addEventListener('click', () => sendServerCommand('restart'));

    // Initial status fetch
    fetchServerStatus();
    // Fetch status every 5 seconds
    setInterval(fetchServerStatus, 5000);
});