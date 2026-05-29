/**
 * Open-Meteo Geocoding API response.
 * https://geocoding-api.open-meteo.com/v1/search
 */
export interface GeocodingResponse {
	results?: GeocodingResult[];
}

export interface GeocodingResult {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	elevation: number;
	country: string;
	country_code: string;
	admin1?: string; // Province / State
	timezone: string;
	population?: number;
}

/**
 * Open-Meteo Forecast API response.
 * https://api.open-meteo.com/v1/forecast
 */
export interface WeatherResponse {
	latitude: number;
	longitude: number;
	timezone: string;
	elevation: number;
	current: CurrentWeather;
}

export interface CurrentWeather {
	time: string;
	temperature_2m: number; // Celsius
	apparent_temperature: number; // Celsius, feels like
	relative_humidity_2m: number; // %
	precipitation: number; // mm
	weather_code: number; // WMO code
	wind_speed_10m: number; // km/h
}

/**
 * Parsed lat/lon + display address from a Zalo location attachment.
 */
export interface ParsedLocation {
	lat: number;
	lon: number;
	address: string;
}
