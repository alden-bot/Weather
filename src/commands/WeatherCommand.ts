import type { Message } from 'zca-js';

import { CommandBase, RichTextParser, CommandContext } from '@/api';

import { OpenMeteoClient } from '../Client/OpenMeteoClient';
import { formatWeatherMessage } from '../formatter';
import type { ParsedLocation } from '../types';

const WAIT_TIMEOUT_MS = 60_000;

export class WeatherCommand extends CommandBase {
	private readonly client = new OpenMeteoClient();
	private readonly activeSessions = new Set<string>();

	public constructor() {
		super({
			name: 'weather',
			description: 'plugin.weather.desc',
			aliases: ['w', 'thoitiet'],
			cooldown: 5,
			usage: 'plugin.weather.usage',
			permission: 'weather.command',
		});
	}

	public async execute(ctx: CommandContext): Promise<void> {
		const { message, args } = ctx;
		if (args.length > 0) {
			await this.fetchByName(ctx, args.join(' '));
			return;
		}

		const userId = message.data.uidFrom;
		const sessionKey = `${message.threadId}_${userId}`;

		if (this.activeSessions.has(sessionKey)) {
			return;
		}

		await ctx.reply(ctx.t('plugin.weather.wait_location'));

		this.activeSessions.add(sessionKey);

		try {
			const loc = await this.waitForLocation(ctx);
			await this.fetchByCoords(ctx, loc);
		} catch (error) {
			const err = error as Record<string, unknown>;
			if (err?.code === 'CANCELLED_BY_USER') {
				this.logger.debug('Location wait cancelled by user');
				return;
			}

			if (err?.code === 'TIMEOUT') {
				this.logger.debug('Location wait timed out');
				await ctx.reply(ctx.t('plugin.weather.timeout'));
				return;
			}

			this.logger.error('Location wait failed with unknown error', error);
		} finally {
			this.activeSessions.delete(sessionKey);
		}
	}

	private async waitForLocation(ctx: CommandContext): Promise<ParsedLocation> {
		let parsedLocation: ParsedLocation | null = null;

		await ctx.waitForAll(
			WAIT_TIMEOUT_MS,
			async (evt) => {
				const location = this.parseLocationEvent(evt, ctx.lang);
				if (location) {
					parsedLocation = location;
					evt.cancel();
					return true;
				}

				if (ctx.isCommandMessage(evt.message)) {
					return false;
				}

				evt.cancel();
				await ctx.reply(ctx.t('plugin.weather.not_location'));
				return false;
			},
		);

		return parsedLocation!;
	}

	private parseLocationEvent(event: unknown, lang: string): ParsedLocation | null {
		const loc = (event as { location?: unknown }).location;
		if (!loc || typeof loc !== 'object') return null;

		const rawLocation = loc as {
			latitude?: unknown;
			longitude?: unknown;
			title?: unknown;
			description?: unknown;
		};

		if (
			typeof rawLocation.latitude !== 'number' ||
			typeof rawLocation.longitude !== 'number' ||
			(rawLocation.latitude === 0 && rawLocation.longitude === 0)
		) {
			return null;
		}

		const title =
			typeof rawLocation.title === 'string' ? rawLocation.title.trim() : '';
		const description =
			typeof rawLocation.description === 'string'
				? rawLocation.description.trim()
				: '';
		const address = [title ? `"${title}"` : '', description]
			.filter((part) => part.length > 0)
			.join(' ');

		return {
			lat: rawLocation.latitude,
			lon: rawLocation.longitude,
			address: address || this.sharedLocationLabel(lang),
		};
	}

	private sharedLocationLabel(lang: string): string {
		return lang === 'vi' ? 'vị trí đã chia sẻ' : 'shared location';
	}

	public cancelAll(): void {
		for (const key of this.activeSessions) {
			const [threadId, userId] = key.split('_');
			this.bot.sessionManager.cancelSession(threadId!, userId!);
		}
		this.activeSessions.clear();
	}

	private async fetchByName(ctx: CommandContext, location: string): Promise<void> {
		await ctx.reply(ctx.t('plugin.weather.searching_name', { location }));

		try {
			const place = await this.client.geocode(location, ctx.lang);

			if (!place) {
				await ctx.reply(ctx.t('plugin.weather.not_found', { location }));
				return;
			}

			const weather = await this.client.getWeather(place.latitude, place.longitude);

			const t = (key: string, params?: Record<string, string | number>) =>
				ctx.t(key, params);
			const reply = formatWeatherMessage(
				place.name,
				place.country,
				place.admin1,
				weather.current,
				t,
			);

			const msgObj = RichTextParser.parse(reply);
			await ctx.reply(msgObj);
		} catch (error) {
			this.logger.error(`WeatherCommand: geocode error for "${location}"`, error);
			await ctx.reply(ctx.t('plugin.weather.error'));
		}
	}

	private async fetchByCoords(
		ctx: CommandContext,
		loc: ParsedLocation,
	): Promise<void> {
		await ctx.reply(ctx.t('plugin.weather.searching_coords'));

		try {
			const weather = await this.client.getWeather(loc.lat, loc.lon);

			const t = (key: string, params?: Record<string, string | number>) =>
				ctx.t(key, params);
			const reply = formatWeatherMessage(loc.address, '', undefined, weather.current, t);

			const msgObj = RichTextParser.parse(reply);
			await ctx.reply(msgObj);
		} catch (error) {
			this.logger.error(`WeatherCommand: coords error (${loc.lat}, ${loc.lon})`, error);
			await ctx.reply(ctx.t('plugin.weather.error'));
		}
	}
}
