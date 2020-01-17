import { DiscordBot } from "../discordbot";
import { randomElementFromArray } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class StandardHandlers extends Plugin {
	inject(context: DiscordBot): void {
		context.handlers = {
			...context.handlers,
			basic_response: (eventData: CommunicationEvent): void => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses));
			},
			bot_shutdown: (eventData: CommunicationEvent): void => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses));
				eventData.bot.stop();
			},
		};
	}
	extract(): void {}
}
