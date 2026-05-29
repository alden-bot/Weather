import type { CurrentWeather } from './types';

const WMO_EMOJIS: Record<number, string> = {
	0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
	45: '🌫️', 48: '🌫️',
	51: '🌦️', 53: '🌦️', 55: '🌦️',
	61: '🌧️', 63: '🌧️', 65: '🌧️',
	71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
	80: '🌦️', 81: '🌦️', 82: '⛈️',
	85: '🌨️', 86: '🌨️',
	95: '⛈️', 96: '⛈️', 99: '⛈️',
};

/**
 * Format a CurrentWeather object into a human-readable Zalo message string.
 */
export function formatWeatherMessage(
	locationName: string,
	country: string,
	region: string | undefined,
	weather: CurrentWeather,
	t: (key: string, params?: Record<string, string | number>) => string,
): string {
	const code = weather.weather_code;
	const emoji = WMO_EMOJIS[code] ?? '🌡️';
	
	let label = t(`wmo.${code}`);
	if (label === `wmo.${code}`) {
		label = t('wmo.unknown', { code });
	}

	return t('plugin.weather.result', {
		emoji,
		locationName,
		region: region ? `, ${region}` : '',
		country: country ? `, ${country}` : '',
		temp: weather.temperature_2m,
		feelsLike: weather.apparent_temperature,
		humidity: weather.relative_humidity_2m,
		windSpeed: weather.wind_speed_10m,
		precipitation: weather.precipitation,
		label,
		time: weather.time.split('T').join(' '),
	});
}
