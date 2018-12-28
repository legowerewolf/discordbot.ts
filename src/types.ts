import { Client, Guild, Message, User } from 'discord.js';
import { DiscordBot } from './discordbot';

export enum IntentsResolutionMethods {
    UseDefault = "useDefault",
    UseCustom = "useCustom",
    MergePreferDefault = "mergePreferDefault",
    MergePreferCustom = "mergePreferCustom"
}

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

    intentsResolutionMethod: IntentsResolutionMethods;
    intents: {
        [key: string]: Intent;
    };

    plugins: Array<string>;
}
export interface Intent {
    models: Array<string>;
    handler: string;
    data?: IntentData;
    permissionLevel?: number;
}

export interface IntentData {
    responses?: Array<string>;
    questionData?: QuestionData;
    handlerSpecific?: any;
}
export interface CommunicationEvent {
    text: string;
    responseCallback: ResponseCallback;
    author: User;
    guild: Guild
    client: Client;
    source: string;

    messageObject?: Message;

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