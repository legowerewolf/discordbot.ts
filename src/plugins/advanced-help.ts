import { stripIndents } from "common-tags";
import { randomElementFromArray, valuesOf } from "../helpers";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class HelpPlugin extends Plugin<{}> {
	inject(context: DiscordBot): void {
		context.handlers["help"] = (event: CommunicationEvent): void => {
			event.responseCallback(
				stripIndents`
                    Here's what I can do for you on request:

                    ${valuesOf(event.bot.config.intents)
						.filter((intent) => intent.models && intent.description && intent.name && event.bot.checkPermission(event.member, intent))
						.map(
							(intent) => stripIndents`
                                **${intent.name}**
                                Invocation example: \`@${event.guild.me.nickname} ${randomElementFromArray(intent.models)}\`
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
		delete context.handlers.help;
	}
}
