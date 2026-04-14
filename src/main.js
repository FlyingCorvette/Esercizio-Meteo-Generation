/**
 * Main CLI - Interfaccia a linea di comando interattiva
 * 
 * Questo file permette all'utente di:
 * 1. Inserire il nome della città tramite terminal
 * 2. Visualizzare il meteo attuale
 * 3. Vedere i dati dal cache o da API
 * 
 * come eseguire:
 * node src/main.js
 */

import { getWeatherByCity } from './models/weather_model.js';
import { getCacheStatus, CACHE_DURATION } from './utils/cache.js';
import readline from 'readline';

/**
 * Crea un'interfaccia per leggere l'input dall'utente
 * (è come "ascoltare" quello che digita)
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Funzione per fare una domanda all'utente e aspettare la risposta
 */
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Funzione per formattare i secondi in un testo leggibile
 * Esempio: 86400 secondi = "1 giorno"
 */
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

/**
 * Funzione principale dell'app
 */
async function main() {
    console.clear();
    console.log('╔═══════════════════════════════════════╗');
    console.log('║        🌤️  METEO ESERCIZIO          ║');
    console.log('║    Scopri il meteo attuale           ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log();

    let continueApp = true;

    while (continueApp) {
        try {
            // Chiediamo all'utente il nome della città
            const city = await askQuestion('📍 Inserisci il nome della città: ');

            if (!city) {
                console.log('⚠️  Per favore, inserisci un nome di città valido!\n');
                continue;
            }

            // Mostriamo un messaggio di caricamento
            console.log('\n⏳ Sto cercando il meteo per ' + city + '...\n');

            // Otteniamo i dati meteo
            const weather = await getWeatherByCity(city);

            // Mostriamo i risultati con un formato carino
            console.log('╔═══════════════════════════════════════╗');
            console.log('║           ✅ METEO TROVATO!          ║');
            console.log('╚═══════════════════════════════════════╝\n');

            console.log(`📍 Città: ${weather.city}`);
            console.log(`🌡️  Temperatura: ${weather.temperature}°C`);
            console.log(`☁️  Condizioni: ${weather.description}`);

            // Mostriamo informazioni sul cache
            const cacheStatus = getCacheStatus();
            const cityCache = cacheStatus.find(c => c.city === city.toLowerCase());

            if (cityCache) {
                const cacheAgeMs = cityCache.savedMinutesAgo * 60 * 1000;
                const timeUntilRefresh = CACHE_DURATION - cacheAgeMs;
                const timeFormatted = formatTime(timeUntilRefresh);

                console.log('\n📊 Informazioni Cache:');
                console.log(`  ✓ Dati recuperati dal cache`);
                console.log(`  ✓ Salvato: ${cityCache.savedMinutesAgo} minuti fa`);
                console.log(`  ✓ Valido per altri: ${timeFormatted}`);
            }

            console.log();

        } catch (error) {
            // Se c'è un errore, lo mostriamo
            console.log('\n❌ Errore: ' + error.message);
            console.log();
        }

        // Chiediamo se vuole cercare un'altra città
        const again = await askQuestion('Vuoi cercare un\'altra città? (si/no): ');

        if (again.toLowerCase() !== 'si' && again.toLowerCase() !== 's') {
            continueApp = false;
        }

        console.log();
    }

    // Il programma termina
    console.log('👋 Arrivederci!');
    rl.close();
}

// Avvia l'app
main();
