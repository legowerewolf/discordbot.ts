import { Client, Guild, Message } from "discord.js";
import ratlog from "ratlog";
import "source-map-support/register";
import { Brain } from "./Brain";
import { CommunicationEvent } from "./CommunicationEvent";
import { ConfigElement } from "./ConfigElement";
import { IntentHandler } from "./IntentHandler";
import { ModuleWithClassDefault } from "./ModuleWithClassDefault";
import { Plugin } from "./Plugin";
import { Vocab } from "./Vocab";

export class DiscordBot {
	config: ConfigElement;
	brain: Brain;
	client: Client;
	plugins: Array<Plugin<{}>>;
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
				handler: (msg: Message): void => {
					if (!msg.author.bot && msg.mentions.users.has(this.client.user.id)) {
						this.handleInput({
							text: msg.cleanContent,
							responseCallback: (response: string) => msg.reply(response),
							author: msg.author,
							member: msg.member,
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
				handler: (): void => {
					this.console(`Shard ready. Connected to ${this.client.guilds.size} guilds.`, Vocab.Info);

					// The values for "META_VERSION" and "META_HASH" are filled in at build time.
					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					// @ts-ignore
					this.client.user.setActivity(`v${META_VERSION} / ${META_HASH}`);
				},
			},
			{
				event: "guildCreate",
				handler: (newGuild: Guild): void => this.console(`Bot added to guild: ${newGuild.name}`, Vocab.Info),
			},
			{
				event: "error",
				handler: (error: Error): void => this.console(error.message, Vocab.Error),
			},
			{
				event: "warn",
				handler: (info: string): void => this.console(info, Vocab.Warn),
			},
		].forEach((element) => {
			this.client.on(element.event, element.handler);
		});

		this.handlers = {};
		this.plugins = new Array<Plugin<{}>>();
		Object.keys(this.config.plugins).map(async (name: string) => {
			import(`../plugins/${name}`).then(
				(module: ModuleWithClassDefault<Plugin<{}>>) => {
					const instance: Plugin<{}> = new module.default(this.config.plugins[name]);
					instance.inject(this);
					this.plugins.push(instance);
				},
				(reason) => {
					this.console(`Unable to load plugin`, { pluginName: name, reason: reason }, Vocab.Error);
				}
			);
		}, this);
	}

	start(): void {
		this.client.login(this.config.APIKeys.discord);
	}

	stop(): void {
		this.plugins.map((plugin) => plugin.extract(this));
		this.client.destroy();
		process.exit();
	}

	handleInput(eventData: CommunicationEvent): void {
		const intentName = this.brain.interpret(eventData.text).label;
		const intent = this.config.intents[intentName];

		eventData.config = intent.data;
		eventData.bot = this;

		const userPermissions = eventData.member?.permissions?.toArray() ?? [];
		if (intent.accessPermissions.some((requiredPermission) => userPermissions.findIndex((hasPermission) => hasPermission === requiredPermission) != -1) || this.config.admins?.findIndex((admin) => admin === eventData.author.id) != -1) {
			if (intent.handler) {
				// If an intent handler is explicitly provided
				this.handlers[intent.handler](eventData);
			} else {
				this.console(`You must use explicitly-named handlers for intents.`, { intent: intentName }, Vocab.Error);
			}
			if (intentName == "_unknown") {
				this.console(`Unknown message`, { message: eventData.text }, Vocab.Warn);
			}
		} else {
			eventData.responseCallback("You don't have permission to ask that.");
		}
	}

	console = ratlog.logger((log) => {
		this.client.shard.send(log);
	});
}