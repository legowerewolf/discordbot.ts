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
				setTimeout(() => {
					eventData.bot.stop();
				}, eventData.config.handlerSpecific.shutdownDelay);
			},
		};
	}
	extract(context: DiscordBot) {}
}
