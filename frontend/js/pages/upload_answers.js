import { checkSession } from '../../shared/auth.js';
import { showNotification } from '../../components/notification.js';
import { uploadExamAnswers } from '../../api/index.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const session = checkSession();
    if (!session.active) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    const uploadForm = document.getElementById('uploadForm');
    const examIdInput = document.getElementById('examId');
    const examFile = document.getElementById('examFile');
    const uploadStatus = document.getElementById('uploadStatus');
    const loadingOverlay = document.getElementById('loadingOverlay');

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const examId = examIdInput.value.trim();
        const file = examFile.files[0];

        if (!examId) {
            showMessage('Por favor, ingresa el ID del Examen (Cuadernillo).', 'warning');
            return;
        }

        if (!file) {
            showMessage('Por favor, selecciona un archivo para subir.', 'warning');
            return;
        }

        if (!isValidFileType(file)) {
            showMessage('Tipo de archivo no permitido. Solo se aceptan .json y .csv', 'error');
            return;
        }

        showLoading(true);
        showMessage('', 'info', true); // Clear previous messages

        const formData = new FormData();
        formData.append('examId', examId);
        formData.append('examFile', file);
        formData.append('userCodigo', session.codigo); // Adjuntar el código del usuario de la sesión

        try {
            const response = await uploadExamAnswers(formData);
            
            if (response.success) {
                let message = `Archivo subido exitosamente.`;
                if (response.grade !== undefined && response.grade !== null) {
                    message += ` Calificación: ${response.grade.toFixed(2)}`;
                }
                showMessage(message, 'success');
                showNotification(message, 'success');
                uploadForm.reset(); // Limpiar el formulario
                examIdInput.value = ''; // Limpiar el ID del examen también
            } else {
                showMessage(response.message || 'Error al subir el archivo.', 'error');
                showNotification(response.message || 'Error al subir el archivo.', 'error');
            }
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            const errorMessage = error.message || 'Ocurrió un error inesperado al subir el archivo.';
            showMessage(errorMessage, 'error');
            showNotification('Error de conexión o servidor.', 'error');
        } finally {
            showLoading(false);
        }
    });

    function isValidFileType(file) {
        const allowedTypes = ['application/json', 'text/csv'];
        return allowedTypes.includes(file.type);
    }

    function showMessage(text, type, clear = false) {
        uploadStatus.textContent = text;
        uploadStatus.className = `mensaje ${type} mt-4`; // mt-4 for margin-top
        if (clear) {
            uploadStatus.classList.add('hidden');
        } else {
            uploadStatus.classList.remove('hidden');
        }
    }

    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
});