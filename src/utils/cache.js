/**
 * Modulo di caching per migliorare le prestazioni e la continuità del servizio
 * 
 * Questo modulo salva i risultati delle chiamate API in memoria.
 * Se la stessa città viene richiesta di nuovo, invece di fare una nuova chiamata API,
 * usiamo i dati già salvati (molto più veloce!).
 * 
 * Se l'app va offline e i dati sono in cache, restituiamo quelli anziché dare errore.
 */

/**
 * Map per immagazzinare i dati in cache
 * Struttura: { "cityName": { data: {...}, timestamp: 123456789 } }
 * 
 * Immagina un'agenda dove scrivi le informazioni che hai già cercato
 * così non devi cercarle di nuovo.
 */
const cache = new Map();

/**
 * Durata del cache in millisecondi (24 ore)
 * Dopo 24 ore i dati vengono considerati "vecchi" e ne cerchiamo di nuovi
 */
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore

/**
 * Genera una chiave univoca per il cache
 * Converte il nome della città in minuscole e lo "pulisce" dagli spazi
 * 
 * Esempio: "ROMA" e "roma" saranno trattate come la stessa città
 * 
 * @param {string} cityName - Il nome della città
 * @returns {string} La chiave normalizzata per il cache
 */
function normalizeCacheKey(cityName) {
    return cityName.toLowerCase().trim();
}

/**
 * Controlla se i dati per una città sono già in cache e se sono ancora validi
 * 
 * Se i dati sono in cache E non sono scaduti, restituisce true
 * Se i dati sono scaduti o non esistono, restituisce false
 * 
 * @param {string} cityName - Il nome della città
 * @returns {boolean} true se i dati sono validi, false altrimenti
 */
function isCacheValid(cityName) {
    const key = normalizeCacheKey(cityName);
    const cached = cache.get(key);
    
    // Se non c'è niente in cache, non è valido
    if (!cached) {
        return false;
    }
    
    // Calcola quanto tempo è passato da quando abbiamo salvato i dati
    const elapsedTime = Date.now() - cached.timestamp;
    
    // Se il tempo passato è minore di CACHE_DURATION, i dati sono ancora validi
    return elapsedTime < CACHE_DURATION;
}

/**
 * Recupera i dati dal cache
 * 
 * Se i dati esistono e sono validi, li restituisce.
 * Altrimenti restituisce null.
 * 
 * @param {string} cityName - Il nome della città
 * @returns {Object|null} I dati meteorologici in cache, o null se non disponibili
 */
function getFromCache(cityName) {
    if (!isCacheValid(cityName)) {
        return null;
    }
    
    const key = normalizeCacheKey(cityName);
    return cache.get(key).data;
}

/**
 * Salva i dati nel cache con un timestamp
 * 
 * Quando otteniamo dati dalla API, li salviamo qui per usarli in futuro
 * Salviamo anche il momento esatto (timestamp) in cui abbiamo salvato
 * così sappiamo se i dati sono ancora "freschi"
 * 
 * @param {string} cityName - Il nome della città
 * @param {Object} data - I dati meteorologici da salvare
 */
function saveToCache(cityName, data) {
    const key = normalizeCacheKey(cityName);
    
    cache.set(key, {
        data: data,
        timestamp: Date.now()  // Salva il momento esatto
    });
}

/**
 * Cancella tutti i dati dal cache
 * 
 * Utile se vuoi ricominciare da zero o se vuoi forzare un aggiornamento
 */
function clearCache() {
    cache.clear();
}

/**
 * Restituisce lo stato attuale del cache (per debug)
 * 
 * Utile per capire quali città sono in cache e quando sono state salvate
 * 
 * @returns {Array} Lista di città nel cache con i loro timestamp
 */
function getCacheStatus() {
    const status = [];
    
    for (const [key, value] of cache.entries()) {
        const age = Date.now() - value.timestamp;
        const ageInMinutes = Math.round(age / 60000);
        
        status.push({
            city: key,
            temperature: value.data.temperature,
            description: value.data.description,
            savedMinutesAgo: ageInMinutes,
            isValid: ageInMinutes < (CACHE_DURATION / 60000)
        });
    }
    
    return status;
}

// Esportiamo tutte le funzioni perché altre parti dell'app le possano usare
export {
    getFromCache,
    saveToCache,
    isCacheValid,
    clearCache,
    getCacheStatus,
    CACHE_DURATION
};
