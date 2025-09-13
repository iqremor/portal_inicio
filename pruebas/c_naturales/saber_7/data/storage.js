// Configuración de la base de datos
export const DB_NAME = 'quizDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'intentos';

let db;

/**
 * Inicializa la base de datos IndexedDB.
 * Crea el almacén de objetos si no existe.
 * @returns {Promise<IDBDatabase>} Una promesa que se resuelve con la instancia de la base de datos.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        // Si la base de datos ya está inicializada, la retornamos.
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos IndexedDB:", event.target.error);
            reject("Error al abrir la base de datos.");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        // Este evento solo se dispara cuando la versión cambia (o en la creación).
        request.onupgradeneeded = (event) => {
            const tempDb = event.target.result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                // Creamos un almacén de objetos para los intentos. Usaremos una clave autoincremental.
                const objectStore = tempDb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                // Creamos un índice para buscar intentos por 'nota'. Será útil para encontrar la nota máxima.
                objectStore.createIndex('nota', 'nota', { unique: false });
                objectStore.createIndex('fecha', 'fecha', { unique: false });
            }
        };
    });
}

/**
 * Guarda un intento de quiz en la base de datos.
 * @param {object} intento - El objeto del intento a guardar. Ej: { nota: 4.5, fecha: new Date(), ... }
 * @returns {Promise<void>}
 */
export async function guardarIntento(intento) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = objectStore.add(intento);
            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error("No se pudo guardar el intento:", event.target.error);
                reject("Error al guardar el intento.");
            };
        });
    } catch (error) {
        console.error("Error en la transacción de guardado:", error);
    }
}

/**
 * Obtiene el número total de intentos guardados.
 * @returns {Promise<number>} El número de intentos, o 0 si hay un error.
 */
export async function obtenerNumeroDeIntentos() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.count();

        return new Promise((resolve) => {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error("Error al contar los intentos:", event.target.error);
                resolve(0); // Devolvemos 0 en caso de error.
            };
        });
    } catch (error) {
        console.error("No se pudo acceder a IndexedDB para contar intentos:", error);
        return 0;
    }
}