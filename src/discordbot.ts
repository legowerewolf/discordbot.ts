import * as Discord from 'discord.js';
import { Brain } from './brain';
import { Prefixer } from "./prefixer";
import { CommunicationEvent, ConfigElement, MessageSubscriber, OngoingProcess, SubscriberMessage, SubscriberMessageSources } from './types';

export class DiscordBot {
    config: ConfigElement;
    brain: Brain;
    client: Discord.Client;
    subscribers: Array<MessageSubscriber>;
    processes: Array<OngoingProcess>;

    constructor(config: ConfigElement) {
        this.config = config;

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
                handler: () => { Prefixer.log(config.shortname, `Logged in as ${this.client.user.tag}! ID: ${this.client.user.id}`); }
            }
        ].forEach((element) => { this.client.on(element.event, element.handler) });

        this.subscribers = new Array<MessageSubscriber>();
        if (this.config.subscribers) {
            Object.keys(this.config.subscribers).forEach(element => {
                this.subscribers.push(require(`./messageSubscribers/${element}`).getNew(this.config.subscribers[element]));
            });
        }

        Prefixer.prepare(this.config.shortname)
    }

    start() {
        this.client.login(this.config.APIKeys.discord);
    }

    pushSubscriberMessage(msg: SubscriberMessage) {
        this.subscribers.forEach(element => {
            element.handleMessage(msg);
        });
    }

    handleInput(eventData: CommunicationEvent) {
        var intent = this.config.intents[this.config.intents.map(i => i.name).indexOf(this.brain.interpret(eventData.text).label)];

        eventData.config = intent.data;

        this.pushSubscriberMessage({ message: eventData.text, user: eventData.author.id, source: SubscriberMessageSources.user, intent: intent.name });

        let sendResponse = eventData.responseCallback;
        eventData.responseCallback = (response: string) => {
            sendResponse(response);
            this.pushSubscriberMessage({ message: response, user: eventData.author.id, source: SubscriberMessageSources.bot });
        };
        eventData.subscriberPush = (message: string) => { this.pushSubscriberMessage({ message: message, user: eventData.author.id, source: SubscriberMessageSources.user }); };

        if (!intent.permissionLevel || this.config.users[eventData.author.id].permissionLevel >= intent.permissionLevel) {
            if (intent.handler) { // If an intent handler is explicitly provided
                require("./intentHandlers/" + intent.handler).handler(eventData);
            } else { // Run the handler matching the intent name
                require("./intentHandlers/" + intent.name).handler(eventData);
            }
        } else {
            eventData.responseCallback("You don't have permission to ask that.");
        }
    }
}