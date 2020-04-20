import { randomElementFromArray } from "../helpers/objectsAndArrays";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { Plugin } from "../typedef/Plugin";

export default class StandardHandlers extends Plugin<{}> {
	inject(): void {
		this.declareHandler("basicResponse", (eventData: CommunicationEvent): void => {
			eventData.responseCallback(randomElementFromArray(eventData.config.responses));
		});
		this.declareHandler("botShutdown", (eventData: CommunicationEvent): void => {
			eventData.responseCallback(randomElementFromArray(eventData.config.responses)).finally(() => {
				eventData.bot.stop();
			});
		});
		this.declareHandler("crash", (eventData: CommunicationEvent): void => {
			eventData.responseCallback(randomElementFromArray(eventData.config.responses)).finally(() => {
				setTimeout(() => {
					throw new Error("Manual crash!");
				}, 10);
			});
		});
	}

	extract(): void {
		this.clearHandlers();
	}
}
