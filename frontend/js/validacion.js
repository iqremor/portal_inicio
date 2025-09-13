/**
 * Funciones de validación para el Portal de Evaluación Académica IEM
 */

/**
 * Valida el formato del código estudiantil
 * @param {string} codigo - Código a validar
 * @returns {boolean} - True si el formato es válido
 */
function validarFormatoCodigo(codigo) {
    if (!codigo || typeof codigo !== 'string') {
        return false;
    }
    
    // Remover espacios en blanco
    codigo = codigo.trim().toUpperCase();
    
    // Verificar formato: IEM seguido de exactamente 4 dígitos
    const regex = /^IEM\d{4}$/;
    return regex.test(codigo);
}

/**
 * Normaliza el código estudiantil
 * @param {string} codigo - Código a normalizar
 * @returns {string} - Código normalizado
 */
function normalizarCodigo(codigo) {
    if (!codigo) return '';
    
    return codigo.trim().toUpperCase();
}

/**
 * Obtiene el mensaje de error para un código inválido
 * @param {string} codigo - Código que falló la validación
 * @returns {string} - Mensaje de error específico
 */
function obtenerMensajeError(codigo) {
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

/**
 * Valida el código en tiempo real mientras el usuario escribe
 * @param {string} codigo - Código actual
 * @returns {object} - Objeto con estado de validación y mensaje
 */
function validarTiempoReal(codigo) {
    if (!codigo || codigo.trim() === '') {
        return {
            valido: false,
            mensaje: '',
            tipo: 'neutral'
        };
    }
    
    codigo = codigo.trim().toUpperCase();
    
    // Validaciones progresivas
    if (codigo.length < 3) {
        return {
            valido: false,
            mensaje: 'Continúa escribiendo...',
            tipo: 'info'
        };
    }
    
    if (!codigo.startsWith('IEM')) {
        return {
            valido: false,
            mensaje: 'Debe empezar con "IEM"',
            tipo: 'warning'
        };
    }
    
    if (codigo.length < 7) {
        const faltantes = 7 - codigo.length;
        return {
            valido: false,
            mensaje: `Faltan ${faltantes} caracteres`,
            tipo: 'info'
        };
    }
    
    if (codigo.length > 7) {
        return {
            valido: false,
            mensaje: 'Demasiados caracteres',
            tipo: 'warning'
        };
    }
    
    const numerosParte = codigo.substring(3);
    if (!/^\d{4}$/.test(numerosParte)) {
        return {
            valido: false,
            mensaje: 'Los últimos 4 caracteres deben ser números',
            tipo: 'warning'
        };
    }
    
    return {
        valido: true,
        mensaje: 'Formato correcto',
        tipo: 'success'
    };
}

/**
 * Formatea el código mientras el usuario escribe
 * @param {string} codigo - Código actual
 * @returns {string} - Código formateado
 */
function formatearCodigo(codigo) {
    if (!codigo) return '';
    
    // Remover caracteres no válidos y convertir a mayúsculas
    codigo = codigo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Limitar longitud
    if (codigo.length > 7) {
        codigo = codigo.substring(0, 7);
    }
    
    // Asegurar que empiece con IEM si el usuario está escribiendo
    if (codigo.length > 0 && !codigo.startsWith('IEM')) {
        // Si no empieza con I, E, o M, agregar IEM al inicio
        if (!/^[IEM]/.test(codigo)) {
            codigo = 'IEM' + codigo;
        } else if (codigo.length === 1 && codigo === 'I') {
            // Permitir que el usuario escriba I, luego E, luego M
            return codigo;
        } else if (codigo.length === 2 && codigo === 'IE') {
            return codigo;
        } else if (codigo.length >= 3 && !codigo.startsWith('IEM')) {
            // Corregir automáticamente si no es IEM
            const numeros = codigo.replace(/[^0-9]/g, '');
            codigo = 'IEM' + numeros;
        }
    }
    
    return codigo;
}

/**
 * Extrae información del código estudiantil
 * @param {string} codigo - Código válido
 * @returns {object} - Información extraída
 */
function extraerInfoCodigo(codigo) {
    if (!validarFormatoCodigo(codigo)) {
        return null;
    }
    
    codigo = normalizarCodigo(codigo);
    const numero = codigo.substring(3);
    
    return {
        codigo: codigo,
        numero: numero,
        prefijo: 'IEM',
        esValido: true
    };
}

/**
 * Genera sugerencias de códigos similares (para debugging)
 * @param {string} codigo - Código base
 * @returns {array} - Array de códigos sugeridos
 */
function generarSugerencias(codigo) {
    const sugerencias = [];
    
    if (!codigo) {
        return ['IEM1001', 'IEM1002', 'IEM1003'];
    }
    
    codigo = codigo.trim().toUpperCase();
    
    // Si no empieza con IEM, sugerir con IEM
    if (!codigo.startsWith('IEM')) {
        const numeros = codigo.replace(/[^0-9]/g, '');
        if (numeros.length > 0) {
            sugerencias.push('IEM' + numeros.padStart(4, '0'));
        }
    }
    
    // Si tiene formato parcial, completar
    if (codigo.startsWith('IEM') && codigo.length < 7) {
        const numerosParte = codigo.substring(3);
        const numerosCompletos = numerosParte.padEnd(4, '0');
        sugerencias.push('IEM' + numerosCompletos);
    }
    
    return sugerencias.slice(0, 3); // Máximo 3 sugerencias
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarFormatoCodigo,
        normalizarCodigo,
        obtenerMensajeError,
        validarTiempoReal,
        formatearCodigo,
        extraerInfoCodigo,
        generarSugerencias
    };
}

