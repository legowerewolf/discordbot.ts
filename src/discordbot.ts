import * as Discord from 'discord.js';
import { Brain } from './brain';
import { getPropertySafe } from './helpers';
import { ERROR, ERROR_LEVEL_PREFIXES, INFO, Prefixer, WARN } from "./prefixer";
import { CommunicationEvent, ConfigElement, MessageSubscriber, OngoingProcess, SubscriberMessage, SubscriberMessageSources } from './types';

export class DiscordBot {
    config: ConfigElement;
    brain: Brain;
    client: Discord.Client;
    subscribers: Array<MessageSubscriber>;
    processes: Array<OngoingProcess>;

    constructor(config: ConfigElement) {
        this.config = config;

        Prefixer.prepare(this.config.shortname);

        this.brain = new Brain();
        config.intents.filter(element => element.models != undefined).forEach((intent) => {
            this.brain.teach(intent.models, intent.name);
        });
        this.brain.train();

        this.client = new Discord.Client();
        [
            {
                event: "message",
                handler: (msg: Discord.Message) => {
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
                    this.console(INFO, `Connected as @${this.client.user.tag}. ID: ${this.client.user.id}`);
                    this.console(INFO, `Guilds: ${[...this.client.guilds.values()].map(guild => `${guild.name}#${guild.id}`).join(", ")}`);
                }
            },
            {
                event: "error",
                handler: (error: Error) => { this.console(ERROR, error.message); }
            },
            {
                event: "warn",
                handler: (info: string) => { this.console(WARN, info); }
            },
            {
                event: "presenceUpdate",
                handler: (oldMember: Discord.GuildMember, member: Discord.GuildMember) => {
                    let guild = oldMember.guild;
                    let gameRoles = guild.roles.filter((value: Discord.Role) => value.name.startsWith("in:"));
                    if (guild.me.permissions.has("MANAGE_ROLES") && oldMember.presence.game != member.presence.game && !member.user.bot) {

                        let instance = Math.random();

                        let currentGame = member.presence.game;
                        if (currentGame != null) {
                            new Promise((resolve, reject) => { // Find or make the role
                                let r = gameRoles.find((value: Discord.Role) => value.name == `in:${currentGame.name}`);
                                resolve(r != null ? r : guild.createRole({ name: `in:${currentGame.name}`, mentionable: true })
                                    .then((role) => {
                                        this.console(INFO, `Created role: ${role.guild.name}/${role.name} (instance: ${instance})`);
                                    }, (error) => {
                                        this.console(ERROR, "Error on role creation.");
                                        this.console(ERROR, `${error}`);
                                    }));
                            })
                                .then((role: Discord.Role) => { // Assign the user to the role
                                    member.addRole(role)
                                        .then((user) => {
                                            this.console(INFO, `Attempted to add ${role} to user ${user.displayName}`);
                                            this.console(INFO, `Added role to user: ${role.guild.name}/${role.name} to ${user.displayName} (instance: ${instance})`);
                                        }, (error) => {
                                            this.console(ERROR, `Error on role assignment. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                            this.console(ERROR, `${error}`);
                                        })
                                })

                        }

                        //Clean up other roles
                        member.roles.filter((value: Discord.Role) => value.name.startsWith("in:") && (currentGame != null ? value.name != `in:${currentGame.name}` : true)).forEach((role) => {
                            member.removeRole(role)
                                .then((member) => {
                                    if (role.members.size == 0) {
                                        role.delete().then(() => {
                                            this.console(INFO, `Deleted role: ${role.guild.name}/${role.name} (instance: ${instance})`);
                                        }, (error) => {
                                            this.console(ERROR, `Error on role deletion. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                            this.console(ERROR, `${error}`);
                                        });
                                    }
                                })
                                .then(() => {
                                    this.console(INFO, `Removed role from user: ${role.guild.name}/${role.name} from ${member.displayName} (instance: ${instance})`);
                                }, (error) => {
                                    this.console(ERROR, `Error on role removal. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                    this.console(ERROR, `${error}`);
                                })

                        })
                    }
                }
            }
        ].forEach((element) => { this.client.on(element.event, element.handler) });

        this.subscribers = new Array<MessageSubscriber>();
        if (this.config.subscribers) {
            Object.keys(this.config.subscribers).forEach(element => {
                this.subscribers.push(require(`./messageSubscribers/${element}`).getNew(this.config.subscribers[element]));
            });
        }

        this.processes = new Array<OngoingProcess>();

    }

    start() {
        this.client.login(this.config.APIKeys.discord);
    }

    pushSubscriberMessage(msg: SubscriberMessage) {
        this.subscribers.forEach(element => {
            element.handleMessage(msg);
        });
    }

    registerOngoingProcess(p: OngoingProcess) {
        this.processes.push(p);
    }

    handleInput(eventData: CommunicationEvent) {
        let intent = this.config.intents[this.config.intents.map(i => i.name).indexOf(this.brain.interpret(eventData.text).label)];

        eventData.config = intent.data;
        eventData.bot = this;

        this.pushSubscriberMessage({ message: eventData.text, user: eventData.author.id, source: SubscriberMessageSources.user, intent: intent.name, failure: intent.name == "error_unknown" });

        let sendResponse = eventData.responseCallback;
        eventData.responseCallback = (response: string) => {
            sendResponse(response);
            this.pushSubscriberMessage({ message: response, user: eventData.author.id, source: SubscriberMessageSources.bot });
        };
        eventData.subscriberPush = (message: string) => { this.pushSubscriberMessage({ message: message, user: eventData.author.id, source: SubscriberMessageSources.user }); };

        let userPermissionLevel = getPropertySafe(this.config.users, `${eventData.author.id}.permissionLevel`);
        if (!intent.permissionLevel || (userPermissionLevel ? userPermissionLevel : this.config.defaultPermissionLevel) >= intent.permissionLevel) {
            if (intent.handler) { // If an intent handler is explicitly provided
                require("./intentHandlers/" + intent.handler).handler(eventData);
            } else { // Run the handler matching the intent name
                require("./intentHandlers/" + intent.name).handler(eventData);
            }
        } else {
            eventData.responseCallback("You don't have permission to ask that.");
        }
    }

    console(level: number, message: string) {
        if (this.config.logLevel <= level) {
            Prefixer.log(this.config.shortname, ERROR_LEVEL_PREFIXES[level] + message);
        }
    }
}