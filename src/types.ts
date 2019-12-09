import { Client, Guild, Message, User } from "discord.js";
import { DiscordBot } from "./discordbot";

export enum IntentsResolutionMethods {
	UseDefault = "useDefault",
	UseCustom = "useCustom",
	MergePreferDefault = "mergePreferDefault",
	MergePreferCustom = "mergePreferCustom",
}

export interface ConfigElement {
	logLevel: number;
	defaultPermissionLevel: number;
	APIKeys: {
		discord: string;
		chatbase?: string;
	};
	users?: {
		[key: string]: {
			permissionLevel: number;
		};
	};

	intentsResolutionMethod: IntentsResolutionMethods;
	intents: IntentsMap;

	plugins: {
		[key: string]: any;
	};
}

export interface IntentsMap {
	[key: string]: Intent;
}

export interface Intent {
	name?: string; // Human-readable name for the intent
	description: string; // Human-readable description

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
	guild: Guild;
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
	question?: Array<string>;
	answeredResponse?: Array<string>;
	timeoutResponse?: Array<string>;
	timeout?: number; // ms
	defaultResponses?: Array<string>;
}

export interface NaturalGuess {
	label: string;
	value: number;
}

export abstract class Plugin {
	config: any;
	static defaultConfig: any;

	constructor(_config?: any) {
		this.config = { ...(<typeof Plugin>this.constructor).defaultConfig, ..._config };
	}

	/** Injects the plugin's hooks into the bot.
	 * It's up to the plugin developer to not break anything.
	 *
	 * @param context - the Discord bot context to inject into.
	 */
	abstract inject(context: DiscordBot): void;

	/** Removes the plugin's hooks from the bot.
	 * It's up to the plugin developer to not break anything.
	 *
	 * @param context - the Discord bot context to remove plugin elements from.
	 */
	abstract extract(context: DiscordBot): void;
}

export interface ClassType<T> {
	new (args: any[]): T;
}

export type IntentHandler = (eventData: CommunicationEvent) => void;
