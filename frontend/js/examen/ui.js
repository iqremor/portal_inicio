import { state } from './state.js';
import { quizConfig, Data } from './constants.js';
import { initZoom } from './zoom.js';

let doIniciarQuiz;
let doSiguienteImagen;
let doIniciarTemporizador;


export function setup(iniciarQuiz, siguienteImagen, iniciarTemporizador) {
    doIniciarQuiz = iniciarQuiz;
    doSiguienteImagen = siguienteImagen;
    doIniciarTemporizador = iniciarTemporizador;
}

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

const contenedorApp = document.getElementById('app');

export function mostrarPaginaInicio() {
    salirDeModoInmersivo();
    state.paginaActual = 'inicio';

    // Comprobar si el usuario ha superado el número de intentos
    if (state.attemptCount >= Data.numIntentos) {
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
    const intentosRestantes = Data.numIntentos - state.attemptCount;
    contenedorApp.innerHTML = `
        <div style="text-align: center; animation: fadeIn 0.5s ease-out;">
            <h1>Prueba Saber</h1>
            <h2 style="font-size: 2rem; color: #ff6b35; text-align: center;">${Data.subject}: Grado ${Data.Grado}</h2>
            <p style="font-size: 1.1em; line-height: 1.6; color: #0a0a0aff; max-width: 600px; margin: 1rem auto 2rem;">
                Esta prueba consta de <strong>${Data.numQuestions} preguntas</strong>. 
                En cada una encontrarás una situación en la que tendrás que aplicar tus
                conocimientos para tomar decisiones y elegir la respuesta correcta.
                <br><br>
                <strong style="color: #0275d8;">Intentos restantes: ${intentosRestantes} de ${Data.numIntentos}</strong>
            </p>
            <button id="btnIniciarQuiz" class="btn btn-primary">Iniciar</button>
        </div>
    `;

    const btnIniciar = document.getElementById('btnIniciarQuiz');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', doIniciarQuiz);
        console.log("--- DEBUG UI: Listener adjuntado a btnIniciarQuiz ---"); // <--- NUEVO DEBUG
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
            <div class="navigation-buttons">
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
    document.getElementById('btnVolverInicio').addEventListener('click', mostrarPaginaInicio);
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