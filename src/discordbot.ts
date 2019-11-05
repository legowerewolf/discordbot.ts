import { Client, Guild, Message } from "discord.js";
import { errorLevelPrefixer, ErrorLevels } from "legowerewolf-prefixer";
import { Brain } from "./brain";
import { parseConfig, valuesOf } from "./helpers";
import { CommunicationEvent, ConfigElement, IntentHandler, Plugin } from "./types";

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
			.forEach((name) => this.brain.teach(this.config.intents[name].models, name));
		this.brain.train();

		this.client = new Client();
		[
			{
				event: "message",
				handler: (msg: Message) => {
					if (!msg.author.bot && msg.mentions.users.has(this.client.user.id)) {
						this.handleInput({
							text: msg.cleanContent,
							responseCallback: (response: string) => msg.reply(response),
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

					// @ts-ignore - these values are filled in on build time
					this.client.user.setPresence({ game: { name: `v${META_VERSION} / ${META_HASH}` } });
				},
			},
			{
				event: "guildCreate",
				handler: (newGuild: Guild) => this.console(ErrorLevels.Info, `Bot added to guild: ${newGuild.name}`),
			},
			{
				event: "error",
				handler: (error: Error) => this.console(ErrorLevels.Error, error.message),
			},
			{
				event: "warn",
				handler: (info: string) => this.console(ErrorLevels.Warn, info),
			},
		].forEach((element) => {
			this.client.on(element.event, element.handler);
		});

		this.handlers = {};
		this.plugins = new Array<Plugin>();
		Object.keys(this.config.plugins).map(async (name: string) => {
			import(`./plugins/${name}`).then(
				({ default: pluginClass }) => {
					let instance: Plugin = new pluginClass(this.config.plugins[name]);
					instance.inject(this);
					this.plugins.push(instance);
				},
				(reason) => {
					this.console(ErrorLevels.Error, `Unable to load plugin ${name}: ${reason}`);
				}
			);
		}, this);
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

		let userPermissionLevel = this.config.users?.[eventData.author.id]?.permissionLevel;
		if (!intent.permissionLevel || (userPermissionLevel ?? this.config.defaultPermissionLevel) >= intent.permissionLevel) {
			if (intent.handler) {
				// If an intent handler is explicitly provided
				this.handlers[intent.handler](eventData);
			} else {
				this.console(ErrorLevels.Error, `You must use explicitly-named handlers for intents. (${intentName})`);
			}
			if (intentName == "_unknown") {
				this.console(ErrorLevels.Warn, `Unknown message: ${eventData.text}`);
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
