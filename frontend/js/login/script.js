/**
 * Script principal para el Portal de Evaluación Académica IEM
 */

// Variables globales
let formularioLogin;
let inputCodigo;
let btnIngresar;
let mensajeDiv;
let loadingOverlay;

// Configuración de la API
const API_BASE = window.location.origin;

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    configurarEventListeners();
    verificarSesionExistente();
});

/**
 * Inicializa las referencias a elementos del DOM
 */
function inicializarElementos() {
    formularioLogin = document.getElementById('loginForm');
    inputCodigo = document.getElementById('codigoEstudiantil');
    btnIngresar = document.getElementById('btnIngresar');
    mensajeDiv = document.getElementById('mensaje');
    loadingOverlay = document.getElementById('loadingOverlay');
    
    // Verificar que todos los elementos existan
    if (!formularioLogin || !inputCodigo || !btnIngresar || !mensajeDiv || !loadingOverlay) {
        console.error('Error: No se pudieron encontrar todos los elementos necesarios');
        mostrarMensaje('Error de inicialización', 'error');
        return;
    }
    
    console.log('Elementos inicializados correctamente');
}

/**
 * Configura todos los event listeners
 */
function configurarEventListeners() {
    // Evento de envío del formulario
    formularioLogin.addEventListener('submit', manejarEnvioFormulario);
    
    // Eventos del input de código
    inputCodigo.addEventListener('input', manejarCambioInput);
    inputCodigo.addEventListener('keypress', manejarTeclaPresionada);
    inputCodigo.addEventListener('paste', manejarPegado);
    
    // Enfocar automáticamente el input
    inputCodigo.focus();
}

/**
 * Maneja el envío del formulario
 */
async function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    const codigo = inputCodigo.value.trim();
    
    // Validar formato antes de enviar
    if (!validarFormatoCodigo(codigo)) {
        const mensajeError = obtenerMensajeError(codigo);
        mostrarMensaje(mensajeError, 'error');
        inputCodigo.focus();
        return;
    }
    
    await validarCodigoConServidor(codigo);
}

/**
 * Maneja los cambios en el input de código
 */
function manejarCambioInput(event) {
    let valor = event.target.value;
    
    // Formatear el código automáticamente
    const valorFormateado = formatearCodigo(valor);
    
    if (valorFormateado !== valor) {
        event.target.value = valorFormateado;
        valor = valorFormateado;
    }
    
    // Validación en tiempo real
    const validacion = validarTiempoReal(valor);
    actualizarEstadoInput(validacion);
    
    // Habilitar/deshabilitar botón
    btnIngresar.disabled = !validacion.valido;
}

/**
 * Maneja las teclas presionadas en el input
 */
function manejarTeclaPresionada(event) {
    // Permitir solo letras, números y teclas de control
    const tecla = event.key;
    const esControl = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(tecla);
    const esAlfanumerico = /^[a-zA-Z0-9]$/.test(tecla);
    
    if (!esControl && !esAlfanumerico) {
        event.preventDefault();
        return;
    }
    
    // Si presiona Enter y el código es válido, enviar formulario
    if (tecla === 'Enter' && validarFormatoCodigo(inputCodigo.value)) {
        manejarEnvioFormulario(event);
    }
}

/**
 * Maneja el pegado de texto en el input
 */
function manejarPegado(event) {
    event.preventDefault();
    
    const textoPegado = (event.clipboardData || window.clipboardData).getData('text');
    const textoFormateado = formatearCodigo(textoPegado);
    
    inputCodigo.value = textoFormateado;
    
    // Disparar evento de cambio manualmente
    const eventoInput = new Event('input', { bubbles: true });
    inputCodigo.dispatchEvent(eventoInput);
}

/**
 * Actualiza el estado visual del input basado en la validación
 */
function actualizarEstadoInput(validacion) {
    const inputGroup = inputCodigo.closest('.input-group');
    const helpText = inputGroup.querySelector('.input-help');
    
    // Remover clases anteriores
    inputCodigo.classList.remove('valid', 'invalid', 'warning');
    
    // Aplicar nueva clase según el tipo
    switch (validacion.tipo) {
        case 'success':
            inputCodigo.classList.add('valid');
            break;
        case 'warning':
            inputCodigo.classList.add('warning');
            break;
        case 'error':
            inputCodigo.classList.add('invalid');
            break;
    }
    
    // Actualizar texto de ayuda si hay mensaje
    if (validacion.mensaje && helpText) {
        helpText.textContent = validacion.mensaje;
        helpText.style.color = getColorForType(validacion.tipo);
    } else if (helpText) {
        helpText.textContent = 'Formato: IEM seguido de 4 números';
        helpText.style.color = '';
    }
}

/**
 * Obtiene el color CSS para un tipo de mensaje
 */
function getColorForType(tipo) {
    switch (tipo) {
        case 'success': return 'var(--accent-color)';
        case 'warning': return 'var(--warning-color)';
        case 'error': return 'var(--danger-color)';
        case 'info': return 'var(--primary-color)';
        default: return 'var(--text-muted)';
    }
}

/**
 * Valida el código con el servidor
 */
async function validarCodigoConServidor(codigo) {
    mostrarCargando(true);
    ocultarMensaje();
    
    try {
        const response = await fetch(`${API_BASE}/api/validar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo: codigo })
        });
        
        const data = await response.json();
        
        if (data.permitido) {
            // Guardar datos del usuario en localStorage con nombres consistentes
            localStorage.setItem('codigoEstudiantil', codigo);
            localStorage.setItem('usuario_nombre', data.nombre);
            localStorage.setItem('usuario_grado', data.grado);
            localStorage.setItem('sesion_inicio', new Date().toISOString());
            
            mostrarMensaje('¡Acceso permitido! Redirigiendo...', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = `frontend/pages/inicio.html?codigo=${codigo}`;
            }, 1500);
            
        } else {
            mostrarMensaje(data.mensaje || 'Código no permitido', 'error');
            inputCodigo.focus();
            inputCodigo.select();
        }
        
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarMensaje('Error de conexión. Por favor, intenta nuevamente.', 'error');
        inputCodigo.focus();
    } finally {
        mostrarCargando(false);
    }
}

/**
 * Muestra u oculta el overlay de carga
 */
function mostrarCargando(mostrar) {
    if (mostrar) {
        loadingOverlay.classList.remove('hidden');
        btnIngresar.disabled = true;
        inputCodigo.disabled = true;
    } else {
        loadingOverlay.classList.add('hidden');
        btnIngresar.disabled = false;
        inputCodigo.disabled = false;
    }
}

/**
 * Muestra un mensaje al usuario
 */
function mostrarMensaje(texto, tipo = 'info') {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.classList.remove('hidden');
    
    // Auto-ocultar mensajes de éxito después de 3 segundos
    if (tipo === 'success') {
        setTimeout(() => {
            ocultarMensaje();
        }, 3000);
    }
}

/**
 * Oculta el mensaje
 */
function ocultarMensaje() {
    mensajeDiv.classList.add('hidden');
}

/**
 * Verifica si hay una sesión existente
 */
function verificarSesionExistente() {
    const codigoGuardado = localStorage.getItem('codigoEstudiantil');
    const nombreGuardado = localStorage.getItem('usuario_nombre');
    const sesionInicio = localStorage.getItem('sesion_inicio');
    
    if (codigoGuardado && nombreGuardado && sesionInicio) {
        // Verificar si la sesión no ha expirado (24 horas)
        const tiempoSesion = new Date() - new Date(sesionInicio);
        const horasTranscurridas = tiempoSesion / (1000 * 60 * 60);
        
        if (horasTranscurridas < 24) {
            mostrarMensaje(`Sesión activa para ${nombreGuardado}. Redirigiendo...`, 'info');
            setTimeout(() => {
                window.location.href = `frontend/pages/inicio.html?codigo=${codigoGuardado}`;
            }, 2000);
            return;
        } else {
            // Limpiar sesión expirada
            limpiarSesion();
        }
    }
}

/**
 * Limpia los datos de sesión del localStorage
 */
function limpiarSesion() {
    localStorage.removeItem('codigoEstudiantil');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_grado');
    localStorage.removeItem('sesion_inicio');
}

/**
 * Maneja errores globales de JavaScript
 */
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    mostrarMensaje('Ha ocurrido un error inesperado', 'error');
});

/**
 * Maneja errores de promesas no capturadas
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada:', event.reason);
    mostrarMensaje('Error de conexión', 'error');
});

// Funciones de utilidad adicionales

/**
 * Debounce para optimizar validaciones en tiempo real
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Función para logging con timestamp
 */
function log(mensaje, tipo = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${tipo.toUpperCase()}] ${mensaje}`);
}

// Exportar funciones para testing (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarCodigoConServidor,
        mostrarMensaje,
        limpiarSesion,
        verificarSesionExistente
    };
}

