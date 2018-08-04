import { randomElementFromArray } from "../helpers";
import { CommunicationEvent } from "../types";

export function handler(eventData: CommunicationEvent) {
    eventData.responseCallback(randomElementFromArray(eventData.config.responses));
    setTimeout(() => {
        eventData.client.destroy();
    }, eventData.config.shutdownDelay)
}