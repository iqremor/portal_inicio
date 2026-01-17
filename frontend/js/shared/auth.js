export function saveSession(sessionData) {
    const session = {
        active: true,
        codigo: sessionData.usuario.codigo,
        username: sessionData.usuario.username,
        role: sessionData.usuario.role,
        nombre_completo: sessionData.usuario.nombre_completo,
        grado: sessionData.usuario.grado,
        sessionId: sessionData.session_id,
        inicio: new Date().toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem('userSession');
}

export function checkSession() {
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) {
        return { active: false };
    }

    const session = JSON.parse(sessionStr);
    const tiempoSesion = new Date() - new Date(session.inicio);
    const horasTranscurridas = tiempoSesion / (1000 * 60 * 60);

    if (horasTranscurridas < 24) {
        return session;
    } else {
        clearSession();
        return { active: false };
    }
}

import { logout } from '../api/index.js';
import { showNotification } from '../components/notification.js';

export async function handleLogout(currentUser) {
    if (currentUser && currentUser.codigo) {
        await logout(currentUser.codigo);
    }
    clearSession();
    showNotification('Sesión cerrada correctamente', 'info');
    setTimeout(() => {
        window.location.href = '/frontend/pages/login.html';
    }, 1000);
}
