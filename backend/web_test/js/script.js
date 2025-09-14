import { setup as setupUI, mostrarPaginaInicio, renderizarImagen, mostrarPaginaFinal } from './ui.js';
import { setupQuiz, iniciarQuiz, siguienteImagen, iniciarTemporizador } from './cuestionario.js';
import { obtenerNumeroDeIntentos } from '../data/storage.js';
import { state } from './state.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar el número de intentos previos desde la base de datos
    state.attemptCount = await obtenerNumeroDeIntentos();

    // Setup the dependencies between modules
    setupUI(iniciarQuiz, siguienteImagen, iniciarTemporizador);
    setupQuiz(renderizarImagen, mostrarPaginaFinal);

    // Mostrar la página de inicio para que el usuario comience el quiz
    mostrarPaginaInicio();
});