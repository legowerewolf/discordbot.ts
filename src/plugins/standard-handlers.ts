import { randomElementFromArray } from "../helpers";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class StandardHandlers extends Plugin<{}> {
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
	extract(context: DiscordBot): void {
		delete context.handlers.basic_response;
		delete context.handlers.bot_shutdown;
	}
}
