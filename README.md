# 🌤️ Come Usare l'App Meteo

Adesso puoi inserire il nome della città e ottenere il meteo attuale! Abbiamo 3 modi per usare l'app:

## 1️⃣ **Interfaccia Web (🎨 Consigliato per principianti)**

### Apertura
Naviga a questo percorso nel tuo browser:
```
Per avviare l'app, apri il file index.html che si trova nella cartella src/ui/ utilizzando il tuo browser preferito.
```

Oppure apri il file `src/ui/index.html` direttamente.

### Come usarla
1. **Scrivi il nome della città** nella casella di input
2. **Premi "Cerca"** o premi **Invio**
3. **Vedi il risultato** con temperatura e condizioni meteo

### Vantaggi
✅ Interfaccia grafica moderna e intuitiva
✅ Pulsanti quick per città comuni (Roma, Milano, Londra...)
✅ Animazioni e feedback visivo
✅ Funziona completamente nel browser

---

## 2️⃣ **CLI Interattiva (🖥️ Consigliato per fare pratica)**

### Apertura
Da terminale, nella cartella del progetto:
```bash
node src/main.js
```

### Come usarla
1. **Il programma chiede:** "Inserisci il nome della città:"
2. **Tu digiti:** Milano (oppure un'altra città)
3. **Vedi il risultato:** Temperatura e condizioni meteo
4. **Continua o esci:** Digita "si" per cercare un'altra città, "no" per uscire

### Esempio di output
```
📍 Ricerca meteo per: Roma
🌡️  Temperatura: 5°C
☁️  Condizioni: Prevalentemente sereno

📊 Informazioni Cache:
  ✓ Dati recuperati dal cache
  ✓ Salvato: 0 minuti fa
  ✓ Valido per altri: 23h
```

### Vantaggi
✅ Impari come funzionano i programmi interattivi
✅ Pratica con `readline` e input dell'utente
✅ Vedi le informazioni dettagliate del cache
✅ Perfetto per capire il flusso del codice

---

## 3️⃣ **CLI Veloce (⚡ Consigliato per test)**

### Come usarla
Da terminale:
```bash
# Con una città specifica
node src/test.js Milano

# Con default (Roma)
node src/test.js

# Con città con spazi
node src/test.js "New York"
```

### Output
```
🔍 Ricerca meteo per: Milano
✅ Risultato per Milano:
  📍 Città: Milano
  🌡️  Temperatura: 20.7°C
  ☁️  Condizioni: Parzialmente nuvoloso
```

### Vantaggi
✅ Velocissimo da usare
✅ Perfetto per test
✅ Impari come passare argomenti a Node.js
✅ Una sola riga di comando

---

## 📊 Capire il Sistema di Caching

### Come funziona
```javascript
Prima chiamata (Roma)
└─→ Chiama API (675ms)
    └─→ Salva in cache
    
Seconda chiamata (Roma)
└─→ Legge dal cache (0ms!)
    └─→ Molto più veloce!
```

### Durata cache
- **24 ore**: Dopo 24 ore i dati scadono e faremo una nuova chiamata API
- **Offline**: Se internet cade ma hai dati in cache, continua a funzionare!

### Quali città sono in cache?
Nella CLI interattiva, vedrai:
```
📊 Informazioni Cache:
  ✓ Dati recuperati dal cache
  ✓ Salvato: 5 minuti fa
  ✓ Valido per altri: 23h
```

---

## 🎯 Quale versione scegliere?

| Esigenza | Versione |
|----------|----------|
| Bella interfaccia, facile da usare | **Web** 🎨 |
| Imparare come funzionano i programmi interattivi | **CLI Interattiva** 🖥️ |
| Test veloce, una sola città | **CLI Veloce** ⚡ |

---

## 📁 Struttura dei file

```
src/
├── ui/
│   └── index.html              ← Interfaccia web
├── models/
│   └── weather_model.js        ← Logica principale (usa il cache)
│   └── weather.model.test.js   ← File di test con Vitest
├── utils/
│   └── cache.js                ← Sistema di caching
├── main.js                     ← CLI interattiva
└── test.js                     ← CLI veloce
```

---

## 💡 Suggerimenti

### Provare tutte e 3!
```bash
# 1. Apri index.html nel browser
# 2. Prova il CLI interattivo
node src/main.js

# 3. Test veloce
node src/test.js Roma
```

### Vedere i dati nel cache
Nella CLI, ogni volta che cerchi una città che hai già cercato, vedrai:
```
✓ Dati recuperati dal cache (molto veloce!)
```

Invece di:
```
⏳ Sto cercando il meteo... (chiama l'API)
```

---

## ❓ Domande comuni

**D: Posso usare la web app senza server?**
R: Sì! Funziona interamente nel browser. Non hai bisogno di un server.

**D: I dati rimangono se chiudo l'app?**
R: No, il cache è in memoria. Se chiudi Node.js o il browser, si cancella. Se vuoi permanenza, dovresti usare LocalStorage (web) o un database.

**D: Quali città supporta?**
R: Qualsiasi città nel mondo! Usa il database Open-Meteo che è grandissimo.

**D: Che succede se digito una città che non esiste?**
R: L'app ti darà un errore: "Città non trovata"

---

## 🚀 Prossimi passi

Quando sarai pronto:
1. Aggiungi più città quick buttons nella web UI
2. Salva il cache in un file usando `fs`
3. Aggiungi previsioni per i prossimi giorni
4. Mostra le coordinate geografiche della città

Buon divertimento! 🌤️

## Dipendenze

- **Vitest**: Un framework di testing per JavaScript. Distribuito sotto la licenza MIT.