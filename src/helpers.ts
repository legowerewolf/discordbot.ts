import { Message } from 'discord.js';
import { CommunicationEvent } from './types';

export function randomElementFromArray(array: Array<any>) {
    return array[Math.floor(Math.random() * array.length)];
}

export function responseToQuestion(eventData: CommunicationEvent): Promise<string> {
    return new Promise((resolve, reject) => {

        let response = randomElementFromArray(eventData.config.questionData.defaultResponses);

        if (eventData.source == "text") { // Only allow the question/response flow on text chats
            eventData.responseCallback(randomElementFromArray(eventData.config.questionData.question));

            let timeout = setTimeout(() => { // Set up a timeout for when to stop listening
                eventData.bot.client.off("message", eventFunc); // Clear the event listener

                eventData.responseCallback(randomElementFromArray(eventData.config.questionData.timeoutResponse));
                resolve(response);
            }, eventData.config.questionData.timeout)

            let eventFunc = function (message: Message) {
                if (message.author.id == eventData.author.id) { // If this is the person we're listening for
                    clearTimeout(timeout); // Clear the timeout
                    eventData.bot.client.off("message", eventFunc); // Clear this event listener

                    eventData.responseCallback(randomElementFromArray(eventData.config.questionData.answeredResponse)); // Send the message that we're done here
                    resolve(message.cleanContent); // Resolve the promise
                }
            }
            eventData.bot.client.on("message", eventFunc);
        } else {
            resolve(response);
        }
    })
}

// From https://stackoverflow.com/a/23809123
export function getPropertySafe(obj: any, key: string) {
    return key.split(".").reduce(function (o, x) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

export function valuesOf(obj: any) { return Object.keys(obj).map((prop: string) => obj[prop]) }