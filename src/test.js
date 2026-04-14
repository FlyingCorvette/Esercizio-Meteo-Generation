/**
 * Test CLI semplice per la funzione getWeatherByCity
 * 
 * Uso:
 * - node src/test.js Roma
 * - node src/test.js "New York"
 * - node src/test.js  (userà "Roma" come default)
 */

import { getWeatherByCity } from './models/weather_model.js';
import { getCacheStatus } from './utils/cache.js';

// Leggiamo il nome della città dalla riga di comando
// Se non viene fornito, usiamo "Roma" come default
const cityInput = process.argv[2] || 'Tokyo';

async function testWeather() {
    try {
        console.log('🔍 Ricerca meteo per: ' + cityInput);
        console.log('-'.repeat(50));
        
        // Otteniamo i dati meteo
        const result = await getWeatherByCity(cityInput);
        
        // Mostriamo i risultati
        console.log('✅ Risultato per ' + result.city + ':');
        console.log('');
        console.log('  📍 Città: ' + result.city);
        console.log('  🌡️  Temperatura: ' + result.temperature + '°C');
        console.log('  ☁️  Condizioni: ' + result.description);
        console.log('');
        
        // Mostriamo lo stato del cache
        const cacheStatus = getCacheStatus();
        if (cacheStatus.length > 0) {
            console.log('📊 Stato Cache:');
            cacheStatus.forEach(city => {
                const icon = city.isValid ? '✅' : '❌';
                console.log(`  ${icon} ${city.city.toUpperCase()}: ${city.temperature}°C (salvato ${city.savedMinutesAgo}m fa)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
        process.exit(1);
    }
}

testWeather();