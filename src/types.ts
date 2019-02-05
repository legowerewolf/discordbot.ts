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
    users?: {
        [key: string]: {
            permissionLevel: number
        }
    };

    intentsResolutionMethod: IntentsResolutionMethods;
    intents: IntentsMap;

    plugins: Array<string>;
}

export interface IntentsMap {
    [key: string]: Intent;
};

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

export interface OngoingProcess {
    active: boolean;
    data: any;
    start: Function;
    stop: Function;
}

export abstract class Plugin {
    abstract inject(context: DiscordBot): void;
}

export interface PluginClass {
    new(): Plugin;
}