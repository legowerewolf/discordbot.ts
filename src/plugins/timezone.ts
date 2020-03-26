import { tz } from "moment-timezone";
import { responseToQuestion } from "../helpers/helpers";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class TimezonePlugin extends Plugin<{}> {
	context: DiscordBot;

	inject(context: DiscordBot): void {
		this.context = context;

		context.handlers = {
			...context.handlers,
			storeTimezone: this.storeTimezone.bind(this),
		};
	}

	extract(): void {
		return;
	}

	storeTimezone(event: CommunicationEvent): void {
		responseToQuestion(event).then((resp) => {
			if (resp && tz.zone(resp)) {
				this.context.persister.writeUser(event.author.id, { timezone: resp });
			}
		});
	}
}
