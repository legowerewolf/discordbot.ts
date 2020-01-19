import { DiscordBot } from "./DiscordBot";
export abstract class Plugin<ConfigType> {
	config: ConfigType;

	// TODO: replace `any` with `ConfigType` (currently triggers ts-2032)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static defaultConfig: any;

	constructor(_config?: ConfigType) {
		this.config = { ...(this.constructor as typeof Plugin).defaultConfig, ..._config };
	}

	/** Injects the plugin's hooks into the bot.
	 * It's up to the plugin developer to not break anything.
	 *
	 * @param context - the Discord bot context to inject into.
	 */

	abstract inject(context: DiscordBot): void;

	/** Removes the plugin's hooks from the bot.
	 * It's up to the plugin developer to not break anything.
	 *
	 * @param context - the Discord bot context to remove plugin elements from.
	 */
	abstract extract(context: DiscordBot): void;
}
