import { DiscordBot } from "../discordbot";
import { randomElementFromArray, valuesOf } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class HelpPlugin extends Plugin {
	inject(context: DiscordBot) {
		context.handlers["help"] = (event: CommunicationEvent) => {
			event.responseCallback(
				`
Here's what I can do for you on request:

${valuesOf(event.bot.config.intents)
	.filter((intent) => intent.models && intent.description && intent.name)
	.map((intent) => `**${intent.name}**\nInvocation example: \`${randomElementFromArray(intent.models)}\`\n${intent.description}`)
	.join("\n\n")}

*The above command models are picked at random from the many I respond to.*
`
			);
		};
	}

	extract() {}
}
