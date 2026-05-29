import type { GeocodingResponse, GeocodingResult, WeatherResponse } from '../types';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_PARAMS = [
	'temperature_2m',
	'apparent_temperature',
	'relative_humidity_2m',
	'precipitation',
	'weather_code',
	'wind_speed_10m',
].join(',');

/**
 * Thin client for the Open-Meteo Geocoding + Forecast APIs.
 * Both APIs are free and require no API key.
 */
export class OpenMeteoClient {
	/**
	 * Resolve a place name to its coordinates.
	 * @returns The best-matching result, or null if not found.
	 */
	public async geocode(location: string, lang: string): Promise<GeocodingResult | null> {
		const params = new URLSearchParams({
			name: location,
			count: '1',
			language: lang,
			format: 'json',
		});

		const response = await fetch(`${GEO_API}?${params}`, {
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) {
			throw new Error(`Geocoding API error: ${response.status}`);
		}

		const data = (await response.json()) as GeocodingResponse;
		return data.results?.[0] ?? null;
	}

	/**
	 * Fetch current weather conditions for a coordinate pair.
	 */
	public async getWeather(lat: number, lon: number): Promise<WeatherResponse> {
		const params = new URLSearchParams({
			latitude: String(lat),
			longitude: String(lon),
			current: CURRENT_PARAMS,
			timezone: 'auto',
			forecast_days: '1',
		});

		const response = await fetch(`${WEATHER_API}?${params}`, {
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) {
			throw new Error(`Weather API error: ${response.status}`);
		}

		return (await response.json()) as WeatherResponse;
	}
}
