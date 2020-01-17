import { stripIndents } from "common-tags";
import { DiscordBot } from "../discordbot";
import { randomElementFromArray, valuesOf } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class HelpPlugin extends Plugin {
	inject(context: DiscordBot): void {
		context.handlers["help"] = (event: CommunicationEvent): void => {
			event.responseCallback(
				stripIndents`
                    Here's what I can do for you on request:

                    ${valuesOf(event.bot.config.intents)
						.filter((intent) => intent.models && intent.description && intent.name)
						.map(
							(intent) => stripIndents`
                                **${intent.name}**
                                Invocation example: \`${randomElementFromArray(intent.models)}\`
                                ${intent.description}
                            `
						)
						.join("\n\n")}

                    *The above examples are picked at random from the many I respond to.*
                    `
			);
		};
	}

	extract(context: DiscordBot): void {
		context.handlers["help"] = null;
	}
}
