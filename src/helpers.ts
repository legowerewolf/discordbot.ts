import { CommunicationEvent, ResponseCallback } from './types';


export function randomElementFromArray(array: Array<any>) {
    return array[Math.floor(Math.random() * array.length)];
}

export function responseToQuestion(eventData: CommunicationEvent, completedCallback: ResponseCallback) {
    let response: string;

    if (eventData.source == "text") { // Only allow the question/response flow on text chats
        eventData.responseCallback(randomElementFromArray(eventData.config.questionData.question));
        let index = 0;
        let maxIndex = eventData.config.questionData.responseCheckDuration / eventData.config.questionData.responseCheckInterval;
        let currentMessageID = eventData.messageObject.id;

        let intervalChecker = setInterval(() => {
            if (eventData.author.lastMessageID != currentMessageID || index > maxIndex) {
                if (eventData.author.lastMessageID != currentMessageID) {
                    response = eventData.author.lastMessage.cleanContent;
                    if (eventData.subscriberPush) { eventData.subscriberPush(response) };
                    eventData.responseCallback(randomElementFromArray(eventData.config.questionData.answeredResponse));
                } else if (index > maxIndex) {
                    eventData.responseCallback(randomElementFromArray(eventData.config.questionData.timeoutResponse));
                }
                clearInterval(intervalChecker);
                completedCallback(response);
            }
            index += 1;
        }, eventData.config.questionData.responseCheckInterval);
    } else {
        completedCallback(response);
    }

}