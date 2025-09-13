export function saveSession(codigo, nombre, grado) {
    localStorage.setItem('codigoEstudiantil', codigo);
    localStorage.setItem('usuario_nombre', nombre);
    localStorage.setItem('usuario_grado', grado);
    localStorage.setItem('sesion_inicio', new Date().toISOString());
}

export function clearSession() {
    localStorage.removeItem('codigoEstudiantil');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_grado');
    localStorage.removeItem('sesion_inicio');
}

export function checkSession() {
    const codigoGuardado = localStorage.getItem('codigoEstudiantil');
    const nombreGuardado = localStorage.getItem('usuario_nombre');
    const sesionInicio = localStorage.getItem('sesion_inicio');

    if (codigoGuardado && nombreGuardado && sesionInicio) {
        const tiempoSesion = new Date() - new Date(sesionInicio);
        const horasTranscurridas = tiempoSesion / (1000 * 60 * 60);

        if (horasTranscurridas < 24) {
            return { active: true, codigo: codigoGuardado, nombre: nombreGuardado };
        } else {
            clearSession();
            return { active: false };
        }
    }
    return { active: false };
}
