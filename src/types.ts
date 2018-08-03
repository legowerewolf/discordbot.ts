import * as Discord from 'discord.js';

export interface ConfigElement {
    shortname: string;
    APIKeys: {
        discord: string;
        chatbase?: string;
    };
    users?: any;
    intents: Array<Intent>;
}
interface Intent {
    name: string;
    models: Array<string>;
    handler: string;
    data?: {
        responses?: Array<string>;
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
    responseCallbackOrig?: ResponseCallback;
    chatbaseRelay?: ResponseCallback;
}

interface ResponseCallback {
    (response: string): void;
}

