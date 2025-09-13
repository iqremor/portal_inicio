export function validarFormatoCodigo(codigo) {
    if (!codigo || typeof codigo !== 'string') {
        return false;
    }
    codigo = codigo.trim().toUpperCase();
    const regex = /^IEM\d{4}$/;
    return regex.test(codigo);
}

export function obtenerMensajeError(codigo) {
    if (!codigo || codigo.trim() === '') {
        return 'Por favor, ingresa tu código estudiantil';
    }
    codigo = codigo.trim().toUpperCase();
    if (codigo.length < 7) {
        return 'El código debe tener al menos 7 caracteres';
    }
    if (codigo.length > 7) {
        return 'El código no debe tener más de 7 caracteres';
    }
    if (!codigo.startsWith('IEM')) {
        return 'El código debe empezar con "IEM"';
    }
    const numerosParte = codigo.substring(3);
    if (!/^\d{4}$/.test(numerosParte)) {
        return 'Después de "IEM" deben ir exactamente 4 números';
    }
    return 'Formato de código inválido';
}

export function getInitials(fullName) {
    const names = fullName.trim().split(' ');
    if (names.length >= 3) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    } else if (names.length === 2) {
        return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    } else if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
    }
    return 'NN';
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}