import { validateCode } from '../api/index.js';
import { saveSession, checkSession } from '../shared/auth.js';
import { validarFormatoCodigo, obtenerMensajeError } from '../shared/utils.js';

document.addEventListener("DOMContentLoaded", () => {
    const session = checkSession();
    if (session.active) {
        window.location.href = `/frontend/pages/dashboard.html?codigo=${session.codigo}`;
        return;
    }

    loadPage();
});

function loadPage() {
    

    

    // Cargar login form
    fetch("/frontend/pages/login-form.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("#main-content").innerHTML = data;
            initializeLogin();
        });
}

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const codigoInput = document.getElementById('codigoEstudiantil');
    const messageDiv = document.getElementById('mensaje');
    const loadingOverlay = document.getElementById('loadingOverlay');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const codigo = codigoInput.value.trim().toUpperCase();

        if (!validarFormatoCodigo(codigo)) {
            showMessage(obtenerMensajeError(codigo), 'error');
            return;
        }

        showLoading(true);

        try {
            const data = await validateCode(codigo);
            if (data.permitido) {
                saveSession(codigo, data.usuario.username, data.usuario.role);
                showMessage('¡Acceso permitido! Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = `/frontend/pages/dashboard.html?codigo=${codigo}`;
                }, 1500);
            } else {
                showMessage(data.mensaje || 'Código no permitido', 'error');
            }
        } catch (error) {
            showMessage('Error de conexión. Por favor, intenta nuevamente.', 'error');
        } finally {
            showLoading(false);
        }
    });

    function showMessage(texto, tipo = 'info') {
        messageDiv.textContent = texto;
        messageDiv.className = `mensaje ${tipo}`;
        messageDiv.classList.remove('hidden');
    }

    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}
