import { state } from './state.js';
import { quizConfig, Data } from './constants.js'; // <--- MODIFICADO: Importar Data
import { initZoom } from './zoom.js';

let doIniciarQuiz;
let doSiguienteImagen;
let doIniciarTemporizador;
let doRecargarImagen;

export async function entrarEnModoInmersivo() {
    const elem = document.documentElement;
    try {
        if (elem.requestFullscreen) {
            await elem.requestFullscreen({ navigationUI: "hide" });
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            await elem.mozRequestFullScreen({ navigationUI: "hide" });
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            await elem.msRequestFullscreen();
        }
    } catch (err) {
        console.warn(`No se pudo entrar en pantalla completa: ${err.message}`);
    }
}

export async function salirDeModoInmersivo() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                await document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                await document.msExitFullscreen();
            }
        } catch (err) {
            console.warn(`No se pudo salir de la pantalla completa: ${err.message}`);
        }
    }
}

export function mostrarAlertaPersonalizada(titulo, mensaje, duracion = 4000) {
    return new Promise(resolve => {
        if (document.querySelector('.custom-alert-overlay')) {
            resolve();
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';

        overlay.innerHTML = `
            <div class="custom-alert-box">
                <h3>${titulo}</h3>
                <p>${mensaje}</p>
            </div>
        `;

        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            resolve();
        }, duracion);
    });
}

let contenedorApp; // Declare it here, but initialize in setup

export function setup(iniciarQuiz, siguienteImagen, iniciarTemporizador, appElement, recargarImagen) { // Add appElement argument
    doIniciarQuiz = iniciarQuiz;
    doSiguienteImagen = siguienteImagen;
    doIniciarTemporizador = iniciarTemporizador;
    contenedorApp = appElement; // Initialize it here
    doRecargarImagen = recargarImagen;
}

export function mostrarPaginaInicio(examDetails) {
    salirDeModoInmersivo();
    state.paginaActual = 'inicio';

    // Comprobar si el usuario ha superado el número de intentos
    if (state.attemptCount >= Data.numIntentos) { // <--- MODIFICADO: Usar Data.numIntentos
        contenedorApp.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.5s ease-out;">
                <h1>Prueba Saber</h1>
                <h2 style="font-size: 1.5rem; color: #d9534f;">Has alcanzado el límite de intentos</h2>
                <p style="font-size: 1.1em; line-height: 1.6; color: #0a0a0aff; max-width: 600px; margin: 1rem auto 2rem;">
                    Has completado los ${Data.numIntentos} intentos permitidos para esta prueba.
                </p>
            </div>
        `;
        return; // Detener la ejecución para no mostrar el botón de inicio
    }

    // Si tiene intentos, mostrar la página de inicio normal
    const intentosRestantes = Data.numIntentos - state.attemptCount; // <--- MODIFICADO: Usar Data.numIntentos
    contenedorApp.innerHTML = `
        <div style="text-align: center; animation: fadeIn 0.5s ease-out;">
            <h1>Prueba Saber</h1>
            <h2 style="font-size: 2rem; color: #ff6b35; text-align: center;">${examDetails.subject}</h2>
            <p style="font-size: 1.1em; line-height: 1.6; color: #0a0a0aff; max-width: 600px; margin: 1rem auto 2rem;">
                Esta prueba consta de <strong>${examDetails.numQuestions} preguntas</strong>. 
                En cada una encontrarás una situación en la que tendrás que aplicar tus
                conocimientos para tomar decisiones y elegir la respuesta correcta.
            </p>
            <button id="btnIniciarQuiz" class="btn btn-primary">Iniciar</button>
        </div>
    `;
    // ...
    const btnIniciar = document.getElementById('btnIniciarQuiz');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', doIniciarQuiz);
    }
}

export function renderizarImagen() {
    const imagePath = state.imageList[state.indicePreguntaActual];

    // Para un temporizador por pregunta, mostramos el tiempo inicial completo.
    const initialMinutes = Math.floor(quizConfig.timerDuration / 60);
    const initialSeconds = quizConfig.timerDuration % 60;
    const tiempoFormateado = `${initialMinutes}:${initialSeconds.toString().padStart(2, '0')}`;

    contenedorApp.innerHTML = `
        <div class="quiz-header-view">
            <div class="timer-container-quiz">
                <span class="timer-label">Tiempo:</span>
                <span id="temporizador-display" class="timer-time">${tiempoFormateado}</span>
            </div>
            <div class="action-buttons">
                <button id="btnRecargarImagen" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534h-.5a.5.5 0 0 1-.5-.5H8a.5.5 0 0 1 .5.5v3.932a.25.25 0 0 1-.418.157L6.879 2.5a.5.5 0 1 1 .707-.707L7.5 3.793V.5a.5.5 0 0 1 1 0v3.293l1.121-1.122a.5.5 0 1 1 .707.707L8.418 4.623A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    Recargar
                </button>
                <button id="btnSiguiente" class="btn btn-secondary" disabled>Siguiente</button>
            </div>
        </div>
        <div class="mb-8">
            <img id="zoomable-image" src="${imagePath}" alt="Imagen del cuadernillo" class="imagen-quiz">
        </div>
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar"></div>
        </div>
    `;

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const progress = ((state.indicePreguntaActual + 1) / state.imageList.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    const reloadImageButton = document.getElementById('btnRecargarImagen');
    if (reloadImageButton) {
        reloadImageButton.addEventListener('click', doRecargarImagen);
    }

    const nextButton = document.getElementById('btnSiguiente');
    nextButton.addEventListener('click', doSiguienteImagen);

    setTimeout(() => {
        nextButton.disabled = false;
    }, quizConfig.nextButtonDelay);

    const imageElement = document.getElementById('zoomable-image');
    if (imageElement) {
        initZoom(imageElement);
    }
}

export function mostrarPaginaFinal() {
    salirDeModoInmersivo();
    state.paginaActual = 'final';

    contenedorApp.innerHTML = `
        <div style="text-align: center; animation: fadeIn 0.5s ease-out;">
            <h2 style="font-size: 2rem; color: #ff6b35;">Prueba Finalizada</h2>
            <p style="font-size: 1.2em; margin: 1.5rem 0;">
                Has completado la prueba.
            </p>
            <div style="text-align: center; margin-top: 2.5rem;">
                <button id="btnReiniciarQuiz" class="btn btn-primary">Volver a Intentar</button>
                <button id="btnVolverInicio" class="btn btn-secondary" style="margin-left: 1rem;">Volver al Inicio</button>
            </div>
        </div>
    `;

    document.getElementById('btnReiniciarQuiz').addEventListener('click', doIniciarQuiz);
    document.getElementById('btnVolverInicio').addEventListener('click', () => {
        window.location.href = '/frontend/pages/dashboard.html';
    });
}

export function mostrarConfirmacion(titulo, mensaje) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';

        overlay.innerHTML = `
            <div class="custom-alert-box">
                <h3>${titulo}</h3>
                <p>${mensaje}</p>
                <div class="confirm-buttons">
                    <button id="confirm-yes" class="btn btn-primary">Anular</button>
                    <button id="confirm-no" class="btn btn-secondary">Continuar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('confirm-yes').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });

        document.getElementById('confirm-no').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
    });
}

export function mostrarAlertaPersonalizadaConBoton(titulo, mensaje) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';

        overlay.innerHTML = `
            <div class="custom-alert-box">
                <h3>${titulo}</h3>
                <p>${mensaje}</p>
                <div class="confirm-buttons">
                    <button id="confirm-ok" class="btn btn-primary">Aceptar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('confirm-ok').addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
    });
}