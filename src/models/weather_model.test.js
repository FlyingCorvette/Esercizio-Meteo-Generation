import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getWeatherByCity } from './weather_model.js';
import * as cache from '../utils/cache.js';

describe('getWeatherByCity', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    // Mock delle funzioni di cache per isolare i test
    vi.spyOn(cache, 'getFromCache').mockReturnValue(null); // Simula cache vuota
    vi.spyOn(cache, 'saveToCache').mockImplementation(() => {}); // No-op per il salvataggio
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restituisce meteo valido per Roma', async () => {
    const geocodingResponse = {
      ok: true,
      json: async () => ({
        results: [{ latitude: 41.9, longitude: 12.5 }]
      })
    };

    const weatherResponse = {
      ok: true,
      json: async () => ({
        current_weather: { temperature: 20, weathercode: 0 }
      })
    };

    global.fetch
      .mockResolvedValueOnce(geocodingResponse)
      .mockResolvedValueOnce(weatherResponse);

    const result = await getWeatherByCity('Roma');

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[0][0]).toContain('geocoding-api.open-meteo.com');
    expect(global.fetch.mock.calls[1][0]).toContain('api.open-meteo.com');
    expect(result).toEqual({
      city: 'Roma',
      temperature: 20,
      description: 'Cielo sereno'
    });
  });

  it('genera errore se la città non è trovata', async () => {
    const geocodingResponse = {
      ok: true,
      json: async () => ({ results: [] })
    };

    global.fetch.mockResolvedValueOnce(geocodingResponse);

    await expect(getWeatherByCity('CittàInesistente')).rejects.toThrow(
      'Città "CittàInesistente" non trovata'
    );
  });

  it('genera errore se il geocoding non risponde con ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(getWeatherByCity('Roma')).rejects.toThrow(
      'Errore: il servizio non ha risposto bene'
    );
  });

  it('genera errore se il servizio meteo non risponde con ok', async () => {
    const geocodingResponse = {
      ok: true,
      json: async () => ({
        results: [{ latitude: 41.9, longitude: 12.5 }]
      })
    };

    const weatherResponse = { ok: false };

    global.fetch
      .mockResolvedValueOnce(geocodingResponse)
      .mockResolvedValueOnce(weatherResponse);

    await expect(getWeatherByCity('Roma')).rejects.toThrow(
      'Errore: il servizio meteo non ha risposto bene'
    );
  });

  it('gestisce codice meteo sconosciuto', async () => {
    const geocodingResponse = {
      ok: true,
      json: async () => ({
        results: [{ latitude: 41.9, longitude: 12.5 }]
      })
    };

    const weatherResponse = {
      ok: true,
      json: async () => ({
        current_weather: { temperature: 15, weathercode: 999 }
      })
    };

    global.fetch
      .mockResolvedValueOnce(geocodingResponse)
      .mockResolvedValueOnce(weatherResponse);

    const result = await getWeatherByCity('Roma');

    expect(result.description).toBe('Condizioni meteorologiche sconosciute');
  });

  it('usa l’encoding corretto per nomi con spazi', async () => {
    const geocodingResponse = {
      ok: true,
      json: async () => ({
        results: [{ latitude: 37.7749, longitude: -122.4194 }]
      })
    };

    const weatherResponse = {
      ok: true,
      json: async () => ({
        current_weather: { temperature: 18, weathercode: 1 }
      })
    };

    global.fetch
      .mockResolvedValueOnce(geocodingResponse)
      .mockResolvedValueOnce(weatherResponse);

    const result = await getWeatherByCity('San Francisco');

    expect(global.fetch.mock.calls[0][0]).toContain('name=San%20Francisco');
    expect(result.city).toBe('San Francisco');
  });
});