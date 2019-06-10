import { Client, Guild, Message } from "discord.js";
import { errorLevelPrefixer, ErrorLevels } from "legowerewolf-prefixer";
import { Brain } from "./brain";
import { getPropertySafe, parseConfig, valuesOf } from "./helpers";
import { CommunicationEvent, ConfigElement, IntentHandler, Plugin, PluginClass } from "./types";

parseConfig().then((config) => {
	new DiscordBot(config).start();
});

export class DiscordBot {
	config: ConfigElement;
	brain: Brain;
	client: Client;
	plugins: Array<Plugin>;
	handlers: { [key: string]: IntentHandler };
	prefix: (msg: string) => string;

	constructor(config: ConfigElement) {
		this.config = config;

		this.brain = new Brain(0.7);
		Object.keys(config.intents)
			.filter((name) => config.intents[name].models != undefined)
			.forEach((name) => {
				this.brain.teach(this.config.intents[name].models, name);
			});
		this.brain.train();

		this.client = new Client();
		[
			{
				event: "message",
				handler: (msg: Message) => {
					if (msg.author.id != this.client.user.id && msg.mentions.users.has(this.client.user.id)) {
						this.handleInput({
							text: msg.cleanContent,
							responseCallback: (response: string) => {
								msg.reply(response);
							},
							author: msg.author,
							guild: msg.guild,
							client: this.client,
							source: "text",
							// Text message only data
							messageObject: msg,
						});
					}
				},
			},
			{
				event: "ready",
				handler: () => {
					this.console(ErrorLevels.Info, `Shard ready. Connected to ${this.client.guilds.size} guilds.`);
				},
			},
			{
				event: "guildCreate",
				handler: (newGuild: Guild) => {
					this.console(ErrorLevels.Info, `Bot added to guild: ${newGuild.name}`);
				},
			},
			{
				event: "error",
				handler: (error: Error) => {
					this.console(ErrorLevels.Error, error.message);
				},
			},
			{
				event: "warn",
				handler: (info: string) => {
					this.console(ErrorLevels.Warn, info);
				},
			},
		].forEach((element) => {
			this.client.on(element.event, element.handler);
		});

		this.plugins = new Array<Plugin>(...this.config.plugins.map((name: string) => require(/* webpackMode: "eager" */ `./plugins/${name}`).default).map((plugin: PluginClass) => new plugin()));
		this.plugins.forEach((p: Plugin) => p.inject(this)); // Inject all plugins
	}

	start() {
		this.client.login(this.config.APIKeys.discord);
	}

	stop() {
		this.plugins.map((plugin) => plugin.extract(this));
		this.client.destroy();
		process.exit();
	}

	handleInput(eventData: CommunicationEvent) {
		let intentName = this.brain.interpret(eventData.text).label;
		let intent = this.config.intents[intentName];

		eventData.config = intent.data;
		eventData.bot = this;

		let userPermissionLevel = getPropertySafe(this.config.users, [eventData.author.id, "permissionLevel"]);
		if (!intent.permissionLevel || (userPermissionLevel ? userPermissionLevel : this.config.defaultPermissionLevel) >= intent.permissionLevel) {
			if (intent.handler) {
				// If an intent handler is explicitly provided
				this.handlers[intent.handler](eventData);
			} else {
				this.console(ErrorLevels.Error, `You must use explicitly-named handlers for intents. (${intentName})`);
			}
		} else {
			eventData.responseCallback("You don't have permission to ask that.");
		}
	}

	console(level: ErrorLevels, message: string) {
		if (this.config.logLevel <= valuesOf(ErrorLevels).findIndex((l) => l == level)) {
			this.client.shard.send(errorLevelPrefixer.prefix(level, message));
		}
	}
}
