import { stripIndents } from "common-tags";
import { randomElementFromArray, valuesOf } from "../helpers/objectsAndArrays";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

/**
 * Adds a help command dynamically generated from content in the config file,
 * with a nice name, description, and invocation example for each annotated command.
 */
export default class HelpPlugin extends Plugin<{}> {
	inject(context: DiscordBot): void {
		context.handlers = {
			...context.handlers,
			help: this.writeHelp.bind(this),
			listPermissions: this.listPermissions.bind(this),
		};
	}

	writeHelp(event: CommunicationEvent): void {
		event.responseCallback(
			stripIndents`
				Here's what I can do for you on request, in this context:

				${valuesOf(event.bot.config.intents)
					.filter((intent) => intent.models && intent.description && intent.name && event.bot.checkPermission(event.author, event.guild, intent))
					.map(
						(intent) => stripIndents`
							**${intent.name}**
							Invocation example: \`@${event.guild?.me.nickname ?? event.client.user.username} ${randomElementFromArray(intent.models)}\`
							${intent.description}
						`
					)
					.join("\n\n")}

				*The above examples are picked at random from the many I respond to.*
				`
		);
	}

	listPermissions(event: CommunicationEvent): void {
		event.responseCallback(
			stripIndents(`
				Here's your permissions in the context of this server (${event.guild.name})
				[${event.guild
					.member(event.author)
					.permissions.toArray()
					.sort()
					.join(", ")}]
			`)
		);
	}

	extract(context: DiscordBot): void {
		delete context.handlers.help;
	}
}
