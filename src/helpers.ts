import { Message } from "discord.js";
import { CommunicationEvent, IntentsMap, IntentsResolutionMethods } from "./types";

export function randomElementFromArray(array: Array<any>) {
	return array[Math.floor(Math.random() * array.length)];
}

export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
	return new Promise((resolve, reject) => {
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

/** Gets a value whose existence is questionable from an object.
 * From https://stackoverflow.com/a/23809123
 *
 * @param obj - an object to get a value from
 * @param key - the path to look for the value
 * @returns the value if it exists, otherwise undefined
 */
export function getPropertySafe(obj: any, key: string) {
	return key.split(".").reduce(function(o, x) {
		return typeof o == "undefined" || o === null ? o : o[x];
	}, obj);
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
