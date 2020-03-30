import { Client, Guild, Message, PermissionString, User } from "discord.js";
import ratlog from "ratlog";
import "source-map-support/register";
import { META_HASH, META_VERSION } from "../helpers/helpers";
import { Brain } from "./Brain";
import { ClassModule } from "./ClassModule";
import { CommunicationEvent } from "./CommunicationEvent";
import { ConfigElement } from "./ConfigElement";
import { Intent } from "./Intent";
import { IntentHandler } from "./IntentHandler";
import { PersistenceProvider } from "./PersistenceProvider";
import { Plugin } from "./Plugin";
import { Vocab } from "./Vocab";

export class DiscordBot {
	config: ConfigElement;
	brain: Brain;
	client: Client;
	plugins: Array<Plugin<unknown>>;
	handlers: { [key: string]: IntentHandler };
	persister: PersistenceProvider;
	listenerOverrides: {
		[key: string]: User;
	} = {};

	constructor(config: ConfigElement) {
		this.config = config;

		this.brain = new Brain(0.7);
		Object.keys(config.intents)
			.filter((name) => config.intents[name].models != undefined)
			.forEach((name) => this.brain.teach(this.config.intents[name].models, name));
		this.brain.train();

		this.client = new Client();
		([
			{
				event: "message",
				handler: (msg: Message): void => {
					if (!msg.author.bot && (msg.mentions.users.has(this.client.user.id) || msg.channel.type == "dm") && this.listenerOverrides[msg.author.id] == undefined) {
						this.handleInput({
							text: msg.cleanContent,
							responseCallback: (response: string) => msg.reply(response),
							author: msg.author,
							member: msg.member,
							guild: msg.guild,
							client: this.client,
							source: msg.channel.type,
							// Text message only data
							messageObject: msg,
						});
					}
				},
			},
			{
				event: "ready",
				handler: async (): Promise<void> => {
					this.console(`Shard ready. Connected to ${this.client.guilds.cache.size} guild${this.client.guilds.cache.size > 1 ? "s" : ""}.`, Vocab.Info);

					this.client.user.setActivity(`v${await META_VERSION} / ${await META_HASH}`);
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
		] as Array<{ event: Parameters<Client["on"]>[0]; handler: Parameters<Client["on"]>[1] }>).forEach((element) => {
			this.client.on(element.event, element.handler);
		});

		this.handlers = {};
		this.plugins = new Array<Plugin<{}>>();
		Object.keys(this.config.plugins).map(async (name: string) => {
			this.console(`Loading plugin...`, { plugin: name }, Vocab.Info);
			import(`../plugins/${name}`).then(
				(module: ClassModule<Plugin<unknown>>) => {
					const instance: Plugin<unknown> = new module.default(this.config.plugins[name]);
					instance.inject(this);
					this.plugins.push(instance);
				},
				(reason) => {
					this.console(`Unable to load plugin`, { pluginName: name, reason: JSON.stringify(reason) }, Vocab.Error);
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

	checkPermission(user: User, guild: Guild, intent: Intent): boolean {
		const userPermissions: PermissionString[] = [];
		if (guild) {
			userPermissions.concat(...guild.member(user).permissions.toArray());
		}
		return (intent.accessPermissions?.some((requiredPermission) => userPermissions.findIndex((hasPermission) => hasPermission === requiredPermission) != -1) ?? true) || this.config.admins?.findIndex((admin) => admin === user.id) != -1;
	}

	handleInput(eventData: CommunicationEvent): void {
		const intentName = this.brain.interpret(eventData.text).label;
		const intent = this.config.intents[intentName];

		eventData.config = intent.data;
		eventData.bot = this;

		if (this.checkPermission(eventData.author, eventData.guild, intent)) {
			if (intent.handler) {
				// If an intent handler is explicitly provided
				this.handlers[intent.handler](eventData);
			} else {
				this.console(`You must use explicitly-named handlers for intents.`, { intent: intentName }, Vocab.Error);
			}
			if (intentName == Brain.UncertainLabel) {
				this.console(`Unknown message`, { message: eventData.text }, Vocab.Warn);
			}
		} else {
			eventData.responseCallback("You don't have permission to ask that.");
		}
	}

	overrideMessageListenerOnce(user: User, duration = 60000): Promise<Message> {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line prefer-const
			let timeout: NodeJS.Timeout;

			const eventFunc = (message: Message): void => {
				if (message.author.id == user.id) {
					clearTimeout(timeout);
					this.client.off("message", eventFunc);
					delete this.listenerOverrides[user.id];

					resolve(message);
				}
			};

			timeout = setTimeout(() => {
				this.client.off("message", eventFunc);
				delete this.listenerOverrides[user.id];

				reject();
			}, duration);

			this.listenerOverrides[user.id] = user;
			this.client.on("message", eventFunc);
		});
	}

	console = ratlog.logger((log) => {
		this.client.shard.send({ type: "log", data: log });
	});
}
