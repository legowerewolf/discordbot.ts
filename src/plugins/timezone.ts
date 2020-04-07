import { tz } from "moment-timezone";
import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { Plugin } from "../typedef/Plugin";

export default class TimezonePlugin extends Plugin<{}> {
	inject(): void {
		this.declareHandler("storeTimezone", this.storeTimezone.bind(this));
	}

	extract(): void {
		this.clearHandlers();
	}

	storeTimezone(event: CommunicationEvent): void {
		responseToQuestion(event).then((resp) => {
			if (resp && tz.zone(resp)) {
				this.context.persister.writeUser(event.author.id, { timezone: resp });
				event.responseCallback("Zone saved!");
			} else if (resp && !tz.zone(resp)) {
				event.responseCallback("Sorry, that's not a valid TZDATA name. Zone has not been updated.");
			}
		});
	}
}
