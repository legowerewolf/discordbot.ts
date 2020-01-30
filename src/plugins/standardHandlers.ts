import { randomElementFromArray } from "../helpers";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class StandardHandlers extends Plugin<{}> {
	inject(context: DiscordBot): void {
		context.handlers = {
			...context.handlers,
			basicResponse: (eventData: CommunicationEvent): void => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses));
			},
			botShutdown: (eventData: CommunicationEvent): void => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses)).finally(() => {
					eventData.bot.stop();
				});
			},
			crash: (eventData: CommunicationEvent): void => {
				eventData.responseCallback(randomElementFromArray(eventData.config.responses)).finally(() => {
					setTimeout(() => {
						throw new Error("Manual crash!");
					}, 10);
				});
			},
		};
	}
	extract(context: DiscordBot): void {
		delete context.handlers.basic_response;
		delete context.handlers.bot_shutdown;
	}
}
