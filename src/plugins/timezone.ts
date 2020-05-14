import { Message, MessageEmbed, User } from "discord.js";
import { tz } from "moment-timezone";
import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

const timeRegex = /t\((.*?)\)/;

export default class TimezonePlugin extends Plugin<{}> {
	context: DiscordBot;

	inject(context: DiscordBot): void {
		this.declareHandler("storeTimezone", this.storeTimezone.bind(this));
		this.context = context;
	}

	extract(): void {
		this.clearHandlers();
	}

	async convertTimezone(msg: Message, targetUser: User) {
		const srcTZ = this.context.persister.readUser(msg.author.id, { timezone: null }).then((data) => data?.timezone);
		const destTZ = this.context.persister.readUser(targetUser.id, { timezone: null }).then((data) => data?.timezone);

		if (!(await srcTZ)) {
			targetUser.dmChannel.send("The message author doesn't have a timezone configured.");
			return;
		}

		if (!(await destTZ)) {
			targetUser.dmChannel.send("You don't have a timezone configured.");
			return;
		}

		targetUser.dmChannel.send(
			new MessageEmbed().setAuthor(msg.author.username, msg.author.avatar).setDescription(
				msg.cleanContent.replace(timeRegex, (match, p1) => {
					return p1;
				})
			)
		);
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
