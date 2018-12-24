import * as Discord from 'discord.js';
import { DiscordBot } from './discordbot';

export interface ConfigElement {
    shortname: string;
    logLevel: number;
    defaultPermissionLevel: number;
    APIKeys: {
        discord: string;
        chatbase?: string;
    };
    subscribers?: any;
    users?: any;
    intents: Array<Intent>;
    plugins: Array<string>;
}
interface Intent {
    name: string;
    models: Array<string>;
    handler: string;
    data?: IntentData;
    permissionLevel?: number;
}

export interface IntentData {
    responses?: Array<string>;
    questionData?: QuestionData;
    intentSpecific?: any;
}
export interface CommunicationEvent {
    text: string;
    responseCallback: ResponseCallback;
    author: Discord.User;
    guild: Discord.Guild;
    client: Discord.Client;
    source: string;

    messageObject?: Discord.Message;

    config?: IntentData;
    subscriberPush?: ResponseCallback;
    bot?: DiscordBot;
}

export interface ResponseCallback {
    (response: string): void;
}

export interface QuestionData {
    questionMessage?: Array<string>;
    answeredResponseMessage?: Array<string>;
    timeoutResponseMessage?: Array<string>;
    responseCheckIntervalMs?: number;
    responseCheckDurationMs?: number;
    defaultResponses?: Array<string>;
}

export interface NaturalGuess {
    label: string;
    value: number;
}

export interface SubscriberMessage {
    message: string;
    user: string;
    source: string;
    intent?: string;
    failure?: boolean;
}

export const SubscriberMessageSources = {
    bot: "BOT",
    user: "USER"
};

export interface MessageSubscriber {
    handleMessage: {
        (message: SubscriberMessage): void;
    }
}

export interface OngoingProcess {
    active: boolean;
    data: any;
    start: Function;
    stop: Function;
}

export abstract class Plugin {
    abstract inject(context: DiscordBot): void;
}