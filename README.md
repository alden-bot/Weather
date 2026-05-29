# Weather Plugin

Weather forecasting system for alden-bot using the Open-Meteo API.

## Features

- **Location Parsing:** Accurately parses Zalo location attachments to fetch weather data for exact coordinates.
- **Text Geocoding:** Supports searching for weather by city or location name.
- **Interactive Sessions:** Utilizes `SessionManager` to wait for a user's location attachment after running the base command.
- **Rich formatting:** Delivers weather reports with parsed location data and styled text.

## Commands

| Command | Aliases | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/weather [location]` | `/w`, `/thoitiet` | `weather.command` | Fetches the current weather for a specified location name or waits for a location attachment if no name is provided. |

## Permissions

- `weather.command` - Default level `0` (Everyone). Allows users to query the weather.

## API Integration

This plugin uses the free, open-source [Open-Meteo API](https://open-meteo.com/). No API key is required.
