import path from 'node:path';
import { I18nManager, PluginBase } from '@/api';
import { WeatherCommand } from './commands/WeatherCommand';

export default class Main extends PluginBase {
	private weatherCommand!: WeatherCommand;

	public async onEnable(): Promise<void> {
		await this.saveResources(['locales/vi.json', 'locales/en.json']);

		this.i18n = new I18nManager(path.join(this.dataFolder, 'locales'), this.bot.config.LANGUAGE);
		await this.i18n.loadLocales();

		this.weatherCommand = new WeatherCommand();
		this.registerCommand(this.weatherCommand);
		this.logger.info('Enabled.');
	}

	public onDisable(): void {
		this.weatherCommand.cancelAll();
		this.logger.info('Disabled.');
	}
}
