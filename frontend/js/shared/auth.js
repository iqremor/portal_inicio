export function saveSession(codigo, username, role) {
    localStorage.setItem('codigoEstudiantil', codigo);
    localStorage.setItem('usuario_username', username);
    localStorage.setItem('usuario_role', role);
    localStorage.setItem('sesion_inicio', new Date().toISOString());
}

export function clearSession() {
    localStorage.removeItem('codigoEstudiantil');
    localStorage.removeItem('usuario_username');
    localStorage.removeItem('usuario_role');
    localStorage.removeItem('sesion_inicio');
}

export function checkSession() {
    const codigoGuardado = localStorage.getItem('codigoEstudiantil');
    const usernameGuardado = localStorage.getItem('usuario_username');
    const roleGuardado = localStorage.getItem('usuario_role');
    const sesionInicio = localStorage.getItem('sesion_inicio');

    if (codigoGuardado && usernameGuardado && roleGuardado && sesionInicio) {
        const tiempoSesion = new Date() - new Date(sesionInicio);
        const horasTranscurridas = tiempoSesion / (1000 * 60 * 60);

        if (horasTranscurridas < 24) {
            return { active: true, codigo: codigoGuardado, username: usernameGuardado, role: roleGuardado };
        } else {
            clearSession();
            return { active: false };
        }
    }
    return { active: false };
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
