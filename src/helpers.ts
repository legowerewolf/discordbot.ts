import { stripIndents } from "common-tags";
import { GuildMember, Message, Role } from "discord.js";
import { mkdirSync, readFile, writeFileSync } from "fs";
import { safeLoad } from "js-yaml";
import { dirname } from "path";
import ratlog, { Ratlogger } from "ratlog";
import { promisify } from "util";
import { CommunicationEvent, ConfigElement, IntentsMap, IntentsResolutionMethods, Vocab } from "./types";

export function randomElementFromArray<T>(array: Array<T>): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
	return new Promise((resolve) => {
		const response = randomElementFromArray(eventData.config.questionData.defaultResponses);

		if (eventData.source == "text") {
			// Only allow the question/response flow on text chats
			eventData.responseCallback(randomElementFromArray(eventData.config.questionData.question));

			// eslint-disable-next-line prefer-const
			let timeout: NodeJS.Timeout;

			const eventFunc = function(message: Message): void {
				if (message.author.id == eventData.author.id) {
					// If this is the person we're listening for
					clearTimeout(timeout); // Clear the timeout
					eventData.bot.client.off("message", eventFunc); // Clear this event listener

					eventData.responseCallback(randomElementFromArray(eventData.config.questionData.answeredResponse)); // Send the message that we're done here
					resolve(message.cleanContent); // Resolve the promise
				}
			};

			timeout = setTimeout(() => {
				// Set up a timeout for when to stop listening
				eventData.bot.client.off("message", eventFunc); // Clear the event listener

				eventData.responseCallback(randomElementFromArray(eventData.config.questionData.timeoutResponse));
				resolve(response);
			}, eventData.config.questionData.timeout);

			eventData.bot.client.on("message", eventFunc);
		} else {
			resolve(response);
		}
	});
}

export function valuesOf<T>(obj: { [key: string]: T }): T[] {
	return Object.keys(obj).map((prop: string) => obj[prop]);
}

export const intentResolver: Map<IntentsResolutionMethods, (defaults: IntentsMap, custom: IntentsMap) => IntentsMap> = new Map([
	[IntentsResolutionMethods.UseDefault, (defaults: IntentsMap): IntentsMap => defaults],
	[IntentsResolutionMethods.UseCustom, (defaults: IntentsMap, custom: IntentsMap): IntentsMap => custom],
	[
		IntentsResolutionMethods.MergePreferCustom,
		(defaults: IntentsMap, custom: IntentsMap): IntentsMap => {
			return { ...defaults, ...custom };
		},
	],
	[
		IntentsResolutionMethods.MergePreferDefault,
		(defaults: IntentsMap, custom: IntentsMap): IntentsMap => {
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
		const defaultConfig: ConfigElement = safeLoad(data[0].toString());
		const customConfig: ConfigElement = safeLoad(data[1].toString());

		if (customConfig === undefined) throw new Error("Malformed configuration data.");

		const resolvedConfig = { ...defaultConfig, ...customConfig }; // Merge preferring custom data

		resolvedConfig.intents = intentResolver.get(resolvedConfig.intentsResolutionMethod)(defaultConfig.intents, customConfig.intents);

		return resolvedConfig;
	});
}

export function roleStringify(role: Role): string {
	return `{name: ${role.name}, id: ${role.id}, guild: ${role.guild.id}, editable?: ${role.editable}}`;
}

export function memberStringify(member: GuildMember): string {
	return `{name: ${member.displayName}, id: ${member.id}, guild: ${member.guild.id}}`;
}

export function promiseRetry<T>(
	promise: () => Promise<T>,
	opts?: {
		backoff?: (last: number, factor: number) => number;
		factor?: number;
		maxDelay?: number;
		delay?: number;
		description?: string;
		console?: Ratlogger;
	}
): Promise<T> {
	opts = { backoff: (last, factor): number => last + factor, factor: 5000, maxDelay: 30000, delay: 0, description: "unnamed promise", console: ratlog(console.log), ...opts };
	return new Promise((resolve) => {
		promise().then(
			(success: T) => {
				opts.console(`Succeeded ${opts.description}`, "promise retry", Vocab.Info);
				resolve(success);
			},
			(reason) => {
				const backoff = Math.min(opts.backoff(opts.delay, opts.factor), opts.maxDelay);
				opts.console(`Failed ${opts.description} (${reason}) (Retrying in ${backoff}ms.)`, "promise retry", Vocab.Error);
				setTimeout(() => {
					resolve(promiseRetry(promise, { ...opts, delay: backoff }));
				}, backoff);
			}
		);
	});
}

export function injectErrorLogger(): void {
	process.addListener("uncaughtException", (error) => {
		const path = `./fatals/${Date.now()}.log`;

		console.error(`Fatal error. See crash dump: ${path}`);

		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(
			path,
			stripIndents`
			${error.name}
			${error.message}
			${error.stack}
		`
		);

		process.exit(1);
	});
}
