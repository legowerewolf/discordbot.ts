import { CommunicationEvent } from "./CommunicationEvent";
import { DiscordBot } from "./DiscordBot";
export abstract class Plugin<ConfigType> {
	protected config: ConfigType;
	protected context: DiscordBot;

	// TODO: replace `any` with `ConfigType` (currently triggers ts-2032)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static defaultConfig: any;

	constructor(context: DiscordBot, _config?: ConfigType) {
		this.context = context;
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

	private handlers = {};
	declareHandler(name: string, handler: (event: CommunicationEvent) => void): void {
		this.handlers = {
			...this.handlers,
			[name]: handler,
		};
		this.context.handlers[name] = handler;
	}
	clearHandlers(): void {
		Object.keys(this.handlers).forEach((handlerName) => {
			if (this.context.handlers[handlerName]) {
				delete this.context.handlers[handlerName];
			}
		});
	}
}
