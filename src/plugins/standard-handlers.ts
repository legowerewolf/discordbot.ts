import { DiscordBot } from "../discordbot";
import { randomElementFromArray } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class StandardHandlers extends Plugin {
	inject(context: DiscordBot) {
		context.handlers = {
			...context.handlers,
			basic_response: (eventData: CommunicationEvent) => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses));
			},
			bot_shutdown: (eventData: CommunicationEvent) => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses));
				eventData.bot.stop();
			},
		};
	}
	extract(context: DiscordBot) {}
}
