import { GuildMember, Role } from "discord.js";
import { readFile } from "fs";
import { safeLoad } from "js-yaml";
import { promisify } from "util";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { Dictionary } from "../typedef/Dictionary";
import { ResolutionMethods } from "../typedef/ResolutionMethods";
import { randomElementFromArray } from "./objectsAndArrays";

export const readFileP = promisify(readFile);

export const META_VERSION = readFileP("./package.json")
	.then((data) => safeLoad(data.toString()))
	.then((data) => data.version);

const getHash = (ref: string, short = true): Promise<string> =>
	readFileP(`./.git/refs/${ref}`)
		.then((chunk) => chunk.toString())
		.then((hash) => (short ? hash.substr(0, 8) : hash));

export const META_HASH = getHash("heads/master", true);

export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
	return new Promise((resolve) => {
		const defaultResponse = randomElementFromArray(eventData.config.questionData.defaultResponses);

		if (["text", "dm"].indexOf(eventData.source) != -1) {
			// Only allow the question/response flow on text chats
			eventData.responseCallback(randomElementFromArray(eventData.config.questionData.question));

			eventData.bot.overrideMessageListenerOnce(eventData.author, eventData.config.questionData.timeout).then(
				(response) => {
					eventData.responseCallback(randomElementFromArray(eventData.config.questionData.answeredResponse));
					resolve(response.cleanContent);
				},
				() => {
					eventData.responseCallback(randomElementFromArray(eventData.config.questionData.timeoutResponse));
					resolve(defaultResponse);
				}
			);
		} else {
			resolve(defaultResponse);
		}
	});
}

export function resolveConflict<T>(method: ResolutionMethods, defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> {
	const m = {
		[ResolutionMethods.UseDefault]: (defaults: Dictionary<T>): Dictionary<T> => defaults,
		[ResolutionMethods.UseCustom]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => custom,
		[ResolutionMethods.MergePreferCustom]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => {
			return { ...defaults, ...custom };
		},
		[ResolutionMethods.MergePreferDefault]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => {
			return { ...custom, ...defaults };
		},
	};

	return m[method](defaults, custom);
}

export function roleStringify(role: Role): string {
	return `{name: ${role.name}, id: ${role.id}, guild: ${role.guild.id}, editable?: ${role.editable}}`;
}

export function memberStringify(member: GuildMember): string {
	return `{name: ${member.displayName}, id: ${member.id}, guild: ${member.guild.id}}`;
}

export function checkContext(context: "server" | "dm", handler: (e: CommunicationEvent) => void) {
	return (event: CommunicationEvent): void => {
		if (context == "server" && !event.guild) {
			event.responseCallback(`I can't do that in this context. You must be in a server.`);
			return;
		}
		if (context == "dm" && event.source != "dm") {
			event.responseCallback(`I can't do that in this context. You must DM me.`);
			return;
		}
		handler(event);
	};
}
