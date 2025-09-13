import { initDB, STORE_NAME } from './storage.js';

/**
 * Reinicia el contador de intentos eliminando todos los registros de la base de datos.
 * @returns {Promise<void>}
 */
export async function reiniciarIntentos() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = objectStore.clear();
            request.onsuccess = () => {
                console.log("Todos los intentos han sido eliminados.");
                resolve();
            };
            request.onerror = (event) => {
                console.error("Error al reiniciar los intentos:", event.target.error);
                reject("Error al reiniciar los intentos.");
            };
        });
    } catch (error) {
        console.error("No se pudo acceder a IndexedDB para reiniciar intentos:", error);
    }
}