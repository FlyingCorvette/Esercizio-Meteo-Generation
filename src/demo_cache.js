/**
 * Demo del sistema di caching
 * 
 * Questo file mostra come il caching migliora le prestazioni
 * della tua app meteo.
 * 
 * Come eseguirlo:
 * node --input-type=module --eval "import('./src/demo_cache.js')"
 */

import { getWeatherByCity } from './models/weather_model.js';
import { getCacheStatus, clearCache } from './utils/cache.js';

console.log('='.repeat(60));
console.log('🌤️  DEMO DEL SISTEMA DI CACHING');
console.log('='.repeat(60));
console.log();

async function demo() {
    try {
        // ===== TEST 1: Prima chiamata per Roma =====
        console.log('📍 TEST 1: Prima chiamata per Roma (da API)');
        console.log('⏱️  Attendere... (chiamata API lenta)');
        
        const start1 = Date.now();
        const weather1 = await getWeatherByCity('Roma');
        const time1 = Date.now() - start1;
        
        console.log(`✅ Risultato: ${weather1.temperature}°C, ${weather1.description}`);
        console.log(`⏱️  Tempo impiegato: ${time1}ms`);
        console.log();
        
        // ===== TEST 2: Seconda chiamata per Roma =====
        console.log('📍 TEST 2: Seconda chiamata per Roma (dal cache)');
        console.log('⏱️  Attendere... (dovrebbe essere VELOCISSIMO!)');
        
        const start2 = Date.now();
        const weather2 = await getWeatherByCity('Roma');
        const time2 = Date.now() - start2;
        
        console.log(`✅ Risultato: ${weather2.temperature}°C, ${weather2.description}`);
        console.log(`⏱️  Tempo impiegato: ${time2}ms`);
        console.log(`🚀 VELOCITÀ: ${Math.round((time1 / time2) * 10) / 10}x più veloce!`);
        console.log();
        
        // ===== TEST 3: Città diversa =====
        console.log('📍 TEST 3: Chiamata per Londra (da API)');
        console.log('⏱️  Attendere... (prima volta, da API)');
        
        const start3 = Date.now();
        const weather3 = await getWeatherByCity('Londra');
        const time3 = Date.now() - start3;
        
        console.log(`✅ Risultato: ${weather3.temperature}°C, ${weather3.description}`);
        console.log(`⏱️  Tempo impiegato: ${time3}ms`);
        console.log();
        
        // ===== Stato del cache =====
        console.log('📊 STATO DEL CACHE:');
        console.log('-'.repeat(60));
        
        const cacheStatus = getCacheStatus();
        
        if (cacheStatus.length === 0) {
            console.log('Cache vuoto');
        } else {
            cacheStatus.forEach(item => {
                const icon = item.isValid ? '✅' : '❌';
                console.log(`${icon} ${item.city.toUpperCase()}`);
                console.log(`   Temperatura: ${item.temperature}°C`);
                console.log(`   Descrizione: ${item.description}`);
                console.log(`   Salvato: ${item.savedMinutesAgo} minuti fa`);
            });
        }
        
        console.log();
        console.log('='.repeat(60));
        console.log('✨ CONCLUSIONI:');
        console.log('='.repeat(60));
        console.log('');
        console.log('1. ⚡ PERFORMANCE: Il cache rende le ricerche ripetute MOLTO veloci');
        console.log('');
        console.log('2. 📡 OFFLINE: Se internet va offline ma hai dati in cache,');
        console.log('              l\'app continua a funzionare!');
        console.log('');
        console.log('3. 🔄 REFRESH: Ogni 24 ore i dati vengono considerati "vecchi"');
        console.log('               e faremo una nuova chiamata API');
        console.log('');
        console.log('4. 💾 RISPARMIO: Meno chiamate API = minore consumo di batteria');
        console.log('                 e connessione internet');
        console.log('');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

// Esegui la demo
demo();
