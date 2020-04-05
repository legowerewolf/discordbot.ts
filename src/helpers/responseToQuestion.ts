import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { randomElementFromArray } from "./objectsAndArrays";
export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
	return new Promise((resolve) => {
		const defaultResponse = randomElementFromArray(eventData.config.question.defaults);
		if (["text", "dm"].indexOf(eventData.source) != -1) {
			// Only allow the question/response flow on text chats
			eventData.responseCallback(randomElementFromArray(eventData.config.question.askMessage));
			eventData.bot.overrideMessageListenerOnce(eventData.author, eventData.config.question.timeout).then(
				(response) => {
					if (eventData.config.question.answeredMessage) eventData.responseCallback(randomElementFromArray(eventData.config.question.answeredMessage));
					resolve(response.cleanContent);
				},
				() => {
					if (eventData.config.question.timeoutMessage) eventData.responseCallback(randomElementFromArray(eventData.config.question.timeoutMessage));
					resolve(defaultResponse);
				}
			);
		} else {
			resolve(defaultResponse);
		}
	});
}
