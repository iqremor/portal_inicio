
// js/zoom.js

// Estado interno del módulo de zoom
const zoomState = {
    zoomLevel: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
    imageElement: null, // El elemento de la imagen que se va a zoomear
};

/**
 * Actualiza la transformación CSS de la imagen (escala y traslación).
 */
function updateImageTransform() {
    if (!zoomState.imageElement) return;
    zoomState.imageElement.style.transform = `scale(${zoomState.zoomLevel}) translate(${zoomState.translateX}px, ${zoomState.translateY}px)`;
    zoomState.imageElement.style.cursor = zoomState.zoomLevel > 1 ? 'move' : 'grab';
}

/**
 * Actualiza el indicador de porcentaje de zoom en la UI.
 */
function updateZoomIndicator() {
    const indicator = document.querySelector(".zoom-indicator");
    if (indicator) {
        indicator.textContent = `${Math.round(zoomState.zoomLevel * 100)}%`;
    }
}

/**
 * Ajusta el nivel de zoom y actualiza la UI.
 * @param {number} delta - La cantidad a aumentar o disminuir el zoom.
 */
export function adjustZoom(delta) {
    zoomState.zoomLevel = Math.max(0.5, Math.min(3, zoomState.zoomLevel + delta));
    updateImageTransform();
    updateZoomIndicator();
}

/**
 * Restablece el zoom y la posición de la imagen a su estado original.
 */
export function resetZoom() {
    zoomState.zoomLevel = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    updateImageTransform();
    updateZoomIndicator();
}

// --- MANEJADORES DE EVENTOS DE DRAG (ARRASTRE) ---

function startDrag(e) {
    if (zoomState.zoomLevel <= 1) return;
    // No prevenir el default para mousedown, pero sí para touchstart para evitar scroll.
    if (e.type === 'touchstart') e.preventDefault();

    zoomState.isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    zoomState.startX = clientX - zoomState.translateX;
    zoomState.startY = clientY - zoomState.translateY;
    zoomState.imageElement.style.cursor = 'grabbing';

    // Añadir listeners al documento para seguir el arrastre fuera de la imagen
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", endDrag);
}

function drag(e) {
    if (!zoomState.isDragging || zoomState.zoomLevel <= 1) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    zoomState.translateX = clientX - zoomState.startX;
    zoomState.translateY = clientY - zoomState.startY;
    updateImageTransform();
}

function endDrag() {
    zoomState.isDragging = false;
    if (zoomState.imageElement) {
        zoomState.imageElement.style.cursor = zoomState.zoomLevel > 1 ? 'move' : 'grab';
    }

    // Eliminar los listeners del documento para limpiar y evitar fugas
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", endDrag);
}

// --- MANEJADORES DE EVENTOS DE LA RUEDA DEL MOUSE Y DOBLE CLIC ---

function handleWheelZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    adjustZoom(delta);
}

function handleDoubleClick() {
    if (zoomState.zoomLevel === 1) {
        adjustZoom(1); // Zoom in a una cantidad fija
    } else {
        resetZoom();
    }
}

/**
 * Maneja los atajos de teclado para el zoom.
 * @param {KeyboardEvent} event - El evento del teclado.
 * @returns {boolean} - Devuelve true si el evento fue manejado.
 */
export function handleZoomKeys(event) {
    // Manejo del scroll vertical con flechas
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const container = document.querySelector('.image-zoom-container');
        if (container) {
            event.preventDefault(); // Evita que la página entera se desplace
            const scrollAmount = 50; // Píxeles a desplazar en cada pulsación
            if (event.key === "ArrowUp") {
                container.scrollTop -= scrollAmount;
            } else {
                container.scrollTop += scrollAmount;
            }
            return true; // Evento manejado
        }
    }

    let eventHandled = true;
    switch (event.key) {
        case "+":
        case "=":
            adjustZoom(0.2);
            break;
        case "-":
            adjustZoom(-0.2);
            break;
        case "0":
            resetZoom();
            break;
        default:
            eventHandled = false;
            break;
    }
    return eventHandled;
}

/**
 * Inicializa la funcionalidad de zoom para un elemento de imagen.
 * Crea los controles de zoom y añade todos los listeners necesarios.
 * @param {HTMLImageElement} imageElement - El elemento de la imagen.
 */
export function initZoom(imageElement) {
    if (!imageElement) return;
    zoomState.imageElement = imageElement;

    // Limpiar instalaciones previas si las hubiera
    const oldContainer = document.querySelector('.image-zoom-container');
    if (oldContainer) {
        oldContainer.parentNode.insertBefore(imageElement, oldContainer);
        oldContainer.remove();
    }
    const oldControls = document.querySelector('.zoom-controls');
    if (oldControls) oldControls.remove();

    // Crear el contenedor para la imagen
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-zoom-container";
    
    const parent = imageElement.parentNode;
    parent.insertBefore(imageContainer, imageElement);
    imageContainer.appendChild(imageElement);
    
    // Crear los controles de zoom
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "zoom-controls";
    
    controlsDiv.innerHTML = `
        <button id="zoom-out-btn" title="Alejar (Zoom Out)" class="zoom-btn">🔍-</button>
        <button id="zoom-reset-btn" title="Restablecer zoom" class="reset-btn">⟲</button>
        <button id="zoom-in-btn" title="Acercar (Zoom In)" class="zoom-btn">🔍+</button>
        <div class="zoom-indicator">100%</div>
    `;
    
    // Get the placeholder and append controls to it
    const zoomControlsPlaceholder = document.getElementById('zoom-controls-placeholder');
    if (zoomControlsPlaceholder) {
        zoomControlsPlaceholder.appendChild(controlsDiv);
    } else {
        // Fallback if placeholder is not found (e.g., for testing or unexpected HTML)
        imageContainer.parentNode.insertBefore(controlsDiv, imageContainer.nextSibling);
    }

    // Añadir listeners a los nuevos botones
    document.getElementById("zoom-in-btn").addEventListener("click", () => adjustZoom(0.2));
    document.getElementById("zoom-out-btn").addEventListener("click", () => adjustZoom(-0.2));
    document.getElementById("zoom-reset-btn").addEventListener("click", resetZoom);
    
    // Listeners para el mouse y eventos táctiles
    imageContainer.addEventListener("wheel", handleWheelZoom);
    // Solo se añaden los listeners que inician el arrastre
    imageElement.addEventListener("mousedown", startDrag);
    imageElement.addEventListener("touchstart", startDrag, { passive: false });
    imageElement.addEventListener("dblclick", handleDoubleClick);

    // Inicializar estado
    resetZoom();
}
