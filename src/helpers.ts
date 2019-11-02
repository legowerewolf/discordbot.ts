import { GuildMember, Message, Role } from "discord.js";
import { readFile } from "fs";
import { safeLoad } from "js-yaml";
import { promisify } from "util";
import { CommunicationEvent, ConfigElement, IntentsMap, IntentsResolutionMethods } from "./types";

export function randomElementFromArray(array: Array<any>) {
	return array[Math.floor(Math.random() * array.length)];
}

export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
	return new Promise((resolve) => {
		let response = randomElementFromArray(eventData.config.questionData.defaultResponses);

		if (eventData.source == "text") {
			// Only allow the question/response flow on text chats
			eventData.responseCallback(randomElementFromArray(eventData.config.questionData.question));

			let timeout = setTimeout(() => {
				// Set up a timeout for when to stop listening
				eventData.bot.client.off("message", eventFunc); // Clear the event listener

				eventData.responseCallback(randomElementFromArray(eventData.config.questionData.timeoutResponse));
				resolve(response);
			}, eventData.config.questionData.timeout);

			let eventFunc = function(message: Message) {
				if (message.author.id == eventData.author.id) {
					// If this is the person we're listening for
					clearTimeout(timeout); // Clear the timeout
					eventData.bot.client.off("message", eventFunc); // Clear this event listener

					eventData.responseCallback(randomElementFromArray(eventData.config.questionData.answeredResponse)); // Send the message that we're done here
					resolve(message.cleanContent); // Resolve the promise
				}
			};
			eventData.bot.client.on("message", eventFunc);
		} else {
			resolve(response);
		}
	});
}

export function valuesOf(obj: any) {
	return Object.keys(obj).map((prop: string) => obj[prop]);
}

export const intentResolver: Map<IntentsResolutionMethods, (defaults: IntentsMap, custom: IntentsMap) => IntentsMap> = new Map([
	[IntentsResolutionMethods.UseDefault, (defaults: IntentsMap, custom: IntentsMap) => defaults],
	[IntentsResolutionMethods.UseCustom, (defaults: IntentsMap, custom: IntentsMap) => custom],
	[
		IntentsResolutionMethods.MergePreferCustom,
		(defaults: IntentsMap, custom: IntentsMap) => {
			return { ...defaults, ...custom };
		},
	],
	[
		IntentsResolutionMethods.MergePreferDefault,
		(defaults: IntentsMap, custom: IntentsMap) => {
			return { ...custom, ...defaults };
		},
	],
]);

const readFileP = promisify(readFile);

export function parseConfig(): Promise<ConfigElement> {
	return Promise.all([
		readFileP("./config/defaults.yaml"),
		readFileP("./config/config.yaml").catch(() => {
			if (process.env.BotConfig) return Buffer.from(process.env.BotConfig);
			else throw new Error("Required custom configuration not found. Create a config file or provide via environment variable.");
		}),
	]).then((data) => {
		let defaultConfig: ConfigElement = safeLoad(data[0].toString());
		let customConfig: ConfigElement = safeLoad(data[1].toString());

		if (customConfig === undefined) throw new Error("Malformed configuration data.");

		let resolvedConfig = { ...defaultConfig, ...customConfig }; // Merge preferring custom data

		resolvedConfig.intents = intentResolver.get(resolvedConfig.intentsResolutionMethod)(defaultConfig.intents, customConfig.intents);

		return resolvedConfig;
	});
}

export function roleStringify(role: Role): string {
	return `{name: ${role.name}, id: ${role.id}, editable?: ${role.editable}}`;
}

export function memberStringify(member: GuildMember) {
	return `{name: ${member.displayName}, id: ${member.id}`;
}

export function promiseRetry(
	promise: () => Promise<any>,
	opts?: {
		backoff?: (last: number, factor: number) => number;
		factor?: number;
		maxDelay?: number;
		delay?: number;
		warnMsg?: string;
		console?: (msg: string) => void;
	}
) {
	opts = { backoff: (last, factor) => last + factor, factor: 5000, maxDelay: 30000, delay: 0, warnMsg: "Promise failed. Retrying...", console: console.log, ...opts };
	return new Promise((resolve, reject) => {
		promise().then(
			(success) => {
				resolve(success);
			},
			(reason) => {
				let backoff = Math.min(opts.backoff(opts.delay, opts.factor), opts.maxDelay);
				opts.console(`${opts.warnMsg} (${reason}) (Retrying in ${backoff}ms.)`);
				setTimeout(() => {
					resolve(promiseRetry(promise, { ...opts, delay: backoff }));
				}, backoff);
			}
		);
	});
}
