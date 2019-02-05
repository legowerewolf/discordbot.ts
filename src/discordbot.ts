
import { Client, Message } from 'discord.js';
import { defaultPrefixer, errorLevelPrefixer, ErrorLevels } from 'legowerewolf-prefixer';
import { Brain } from './brain';
import { getPropertySafe, valuesOf } from './helpers';
import { CommunicationEvent, ConfigElement, OngoingProcess, Plugin } from './types';

export class DiscordBot {
    config: ConfigElement;
    brain: Brain;
    client: Client;
    processes: Array<OngoingProcess>;
    plugins: Array<Plugin>;
    prefix: (msg: string) => string;

    constructor(config: ConfigElement) {
        this.config = config;

        defaultPrefixer.update(this.config.shortname);
        this.prefix = (msg: string) => defaultPrefixer.prefix(this.config.shortname, msg);

        this.brain = new Brain();
        Object.keys(config.intents)
            .filter(name => (config.intents[name]).models != undefined)
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
                            responseCallback: (response: string) => { msg.reply(response) },
                            author: msg.author,
                            guild: msg.guild,
                            client: this.client,
                            source: "text",
                            // Text message only data
                            messageObject: msg
                        });
                    }
                }
            },
            {
                event: "ready",
                handler: () => {
                    this.console(ErrorLevels.Info, `Connected as @${this.client.user.tag}. ID: ${this.client.user.id}`);
                    this.console(ErrorLevels.Info, `Guilds: ${[...this.client.guilds.values()].map(guild => `${guild.name}#${guild.id}`).join(", ")}`);
                }
            },
            {
                event: "error",
                handler: (error: Error) => { this.console(ErrorLevels.Error, error.message); }
            },
            {
                event: "warn",
                handler: (info: string) => { this.console(ErrorLevels.Warn, info); }
            },
        ].forEach((element) => { this.client.on(element.event, element.handler) });

        this.processes = new Array<OngoingProcess>();
        this.plugins = new Array<Plugin>();

        this.plugins.push(...this.config.plugins
            .map(name => `./plugins/${name}`)
            .map(path => require(path).default)
            .map(plugin => new plugin())
        );
        this.plugins.forEach((p: Plugin) => p.inject(this)) // Inject all plugins

    }

    start() {
        this.client.login(this.config.APIKeys.discord);
    }

    registerOngoingProcess(p: OngoingProcess) {
        this.processes.push(p);
    }

    handleInput(eventData: CommunicationEvent) {
        let intentName = this.brain.interpret(eventData.text).label
        let intent = this.config.intents[intentName];

        eventData.config = intent.data;
        eventData.bot = this;

        let userPermissionLevel = getPropertySafe(this.config.users, `${eventData.author.id}.permissionLevel`);
        if (!intent.permissionLevel || (userPermissionLevel ? userPermissionLevel : this.config.defaultPermissionLevel) >= intent.permissionLevel) {
            if (intent.handler) { // If an intent handler is explicitly provided
                require("./intentHandlers/" + intent.handler).handler(eventData);
            } else {
                this.console(ErrorLevels.Error, `You must use explicitly-named handlers for intents. (${intentName})`)
            }
        } else {
            eventData.responseCallback("You don't have permission to ask that.");
        }
    }

    console(level: ErrorLevels, message: string) {
        if (this.config.logLevel <= valuesOf(ErrorLevels).findIndex(l => l == level)) {
            console.log(this.prefix(errorLevelPrefixer.prefix(level, message)))
        }
    }
}