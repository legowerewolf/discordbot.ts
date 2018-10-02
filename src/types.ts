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
}
interface Intent {
    name: string;
    models: Array<string>;
    handler: string;
    data?: {
        responses?: Array<string>;
        questionData?: {
            question?: Array<string>;
            answeredResponse?: Array<string>;
            timeoutResponse?: Array<string>;
            responseCheckInterval?: number;
            responseCheckDuration?: number;
        }
    };
    permissionLevel?: number;
}
export interface CommunicationEvent {
    text: string;
    responseCallback: ResponseCallback;
    author: Discord.User;
    guild: Discord.Guild;
    client: Discord.Client;
    source: string;

    messageObject?: Discord.Message;

    config?: any;
    subscriberPush?: ResponseCallback;
    bot?: DiscordBot;
}

export interface ResponseCallback {
    (response: string): void;
}

export interface QuestionData {
    question: string;
    questionAnswered: string;
    questionTimeout: string;
    callback: ResponseCallback;
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