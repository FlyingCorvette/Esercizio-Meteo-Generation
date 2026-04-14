// Importiamo le funzioni di caching dal modulo cache
import { getFromCache, saveToCache } from '../utils/cache.js';

/**
 * Ottiene le condizioni meteorologiche attuali di una città nel mondo.
 * 
 * Questa funzione converte il nome di una città in coordinate geografiche utilizzando
 * l'API Geocoding di Open-Meteo, quindi recupera i dati meteo attuali per quella posizione.
 * 
 * I dati vengono salvati in cache: se richiedi di nuovo la stessa città entro 24 ore,
 * usheremo i dati già salvati (MOLTO più veloce!).
 * 
 * Se l'app va offline, se abbiamo dati in cache li usiamo automaticamente
 * per garantire la continuità del servizio.
 * 
 * @async
 * @function getWeatherByCity
 * @param {string} cityName - Il nome della città per cui recuperare il meteo (es. "Roma", "Milano", "New York")
 * 
 * @returns {Promise<{
 *   city: string,
 *   temperature: number,
 *   description: string
 * }>} Un oggetto contenente:
 *   - city {string}: Il nome della città cercata
 *   - temperature {number}: La temperatura attuale in gradi Celsius
 *   - description {string}: Una descrizione leggibile delle condizioni meteo
 *     (es. "Cielo sereno", "Pioggia", "Nevicata", ecc.)
 * 
 * @throws {Error} Errore se il geocoding fallisce - il servizio Geocoding non ha risposto correttamente
 * @throws {Error} Errore se la città non viene trovata - il nome non è riconosciuto dall'API
 * @throws {Error} Errore se il servizio meteo fallisce - impossibile recuperare i dati meteo
 * @throws {Error} Errore di connessione - problema di rete o servizi non disponibili (a meno che non abbia dati in cache)
 * 
 * @example
 * // Esempio di utilizzo base
 * try {
 *   const weather = await getWeatherByCity("Roma");
 *   console.log(weather);
 *   // Output: { city: "Roma", temperature: 20, description: "Cielo sereno" }
 * } catch (error) {
 *   console.error("Errore:", error.message);
 * }
 * 
 * @example
 * // Esempio con gestione di errori specifici
 * try {
 *   const weather = await getWeatherByCity("Londra");
 *   console.log(`Temperatura a ${weather.city}: ${weather.temperature}°C`);
 *   console.log(`Condizioni: ${weather.description}`);
 * } catch (error) {
 *   if (error.message.includes("non trovata")) {
 *     console.error("Città non riconosciuta. Prova con un'altra.");
 *   } else if (error.message.includes("servizio")) {
 *     console.error("Il servizio meteo non è disponibile. Riprova più tardi.");
 *   } else {
 *     console.error("Errore di connessione internet.");
 *   }
 * }
 * 
 * @see https://open-meteo.com/en/docs/geocoding-api - Documentazione API Geocoding Open-Meteo
 * @see https://open-meteo.com/en/docs - Documentazione API Meteo Open-Meteo
 * 
 * @note Le API utilizzate sono gratuite e non richiedono autenticazione
 * @note La funzione utilizza il parametro "language=en" per standardizzare le risposte
 * @note Se il codice meteo non è riconosciuto, viene restituito "Condizioni meteorologiche sconosciute"
 * @note I dati vengono memorizzati in cache per 24 ore per migliorare le prestazioni
 */
async function getWeatherByCity(cityName) {
    // ===== PASSO 0: Controllare il cache =====
    // Prima di fare costose chiamate API, vediamo se abbiamo già i dati salvati
    const cachedWeather = getFromCache(cityName);
    
    if (cachedWeather) {
        console.log(`✓ Dati recuperati dal cache per ${cityName}`);
        return cachedWeather;
    }
    try {
        // ===== PASSO 1: Convertire il nome della città in coordinate geografiche =====
        // Immagina di avere un indirizzo stradale.
        // Per trovare il meteo, il servizio online ha bisogno di numeri (coordinate).
        // Questo passo chiede al servizio: "Dove si trova Roma?"
        // E lui risponde con i numeri della posizione (latitudine e longitudine)
        
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        
        // Mandiamo la richiesta al servizio e aspettiamo la risposta
        // (è come mandare una lettera e aspettare una risposta)
        const geocodingResponse = await fetch(geocodingUrl);

        // Controlliamo: il servizio ha risposto bene oppure no?
        // Se c'è un problema (città non trovata, server offline), lo vediamo qui
        if (!geocodingResponse.ok) {
            throw new Error(`Errore: il servizio non ha risposto bene`);
        }

        // La risposta arriva come testo. Lo trasformiamo in dati che JavaScript capisce
        const geocodingData = await geocodingResponse.json();

        // Verifichiamo: il servizio ha trovato la città? Oppure non esiste?
        if (!geocodingData.results || geocodingData.results.length === 0) {
            throw new Error(`Città "${cityName}" non trovata`);
        }

        // Prendiamo i numeri della posizione dalla risposta
        // latitude = latitudine (quanto a nord/sud), longitude = longitudine (quanto a est/ovest)
        const { latitude, longitude } = geocodingData.results[0];

        // ===== PASSO 2: Chiedere il meteo attuale =====
        // Adesso che sappiamo dove si trova la città,
        // chiediamo al servizio: "Che tempo fa qui adesso?"
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        
        // Mandiamo la richiesta e aspettiamo i dati meteo
        const weatherResponse = await fetch(weatherUrl);

        // Controlliamo se la risposta è arrivata bene oppure c'è un errore
        if (!weatherResponse.ok) {
            throw new Error(`Errore: il servizio meteo non ha risposto bene`);
        }

        // Trasformiamo il testo della risposta in dati che JavaScript capisce
        const weatherData = await weatherResponse.json();

        // ===== PASSO 3: Convertire il codice meteo in parole comprensibili =====
        // Il servizio ci dice il meteo come numero (0 = sereno, 3 = nuvoloso, ecc.)
        // Vogliamo trasformare questi numeri in parole: "Soleggiato", "Nuvoloso", ecc.
        
        const weatherDescriptions = {
            0: "Cielo sereno",
            1: "Prevalentemente sereno",
            2: "Parzialmente nuvoloso",
            3: "Nuvoloso",
            45: "Nebbia",
            48: "Nebbia con brina",
            51: "Pioggerella leggera",
            53: "Pioggerella",
            55: "Pioggerella intensa",
            56: "Pioggerella ghiacciata leggera",
            57: "Pioggerella ghiacciata intensa",
            61: "Pioggia leggera",
            63: "Pioggia",
            65: "Pioggia intensa",
            66: "Pioggia ghiacciata leggera",
            67: "Pioggia ghiacciata intensa",
            71: "Nevicata leggera",
            73: "Nevicata",
            75: "Nevicata intensa",
            77: "Granelli di neve",
            80: "Rovesci leggeri",
            81: "Rovesci",
            82: "Rovesci intensi",
            85: "Nevicate leggere",
            86: "Nevicate intense",
            95: "Temporale",
            96: "Temporale con grandine leggera",
            99: "Temporale con grandine intensa"
        };

        // Prendiamo il numero del meteo dalla risposta
        const weatherCode = weatherData.current_weather.weathercode;
        
        // Cerchiamo la descrizione corrispondente a quel numero
        // Se non la troviamo, mettiamo un messaggio generico
        const description = weatherDescriptions[weatherCode] || "Condizioni meteorologiche sconosciute";

        // ===== PASSO 4: Restituire i risultati =====
        // Ritorniamo tutto quello che abbiamo trovato, ben organizzato
        const result = {
            city: cityName,                          // Il nome della città
            temperature: weatherData.current_weather.temperature,      // I gradi (es. 20°C)
            description: description                 // La descrizione (es. "Soleggiato")
        };
        
        // Salviamo i dati nel cache per usarli la prossima volta
        // Così se richiedi di nuovo "Roma", non doveremo fare un'altra chiamata API
        saveToCache(cityName, result);
        
        return result;
    } catch (error) {
        // ===== SE QUALCOSA VA STORTO =====
        // Se c'è un problema (internet offline, città non trovata, ecc.)
        // lo gestiamo qui e diamo un messaggio chiaro
        
        console.error('Errore:', error);
        
        // CONTINUITÀ DEL SERVIZIO: Se l'API non risponde ma abbiamo dati in cache,
        // usare quelli anziché dare errore.
        // Questo permette all'app di funzionare anche offline!
        const cachedFallback = getFromCache(cityName);
        
        if (cachedFallback) {
            console.log(`⚠️  API Error, using cached data for ${cityName}`);
            return cachedFallback;
        }
        
        // Se non abbiamo nemmeno il cache, allora diamo l'errore
        throw error;
    }
}

export { getWeatherByCity };
