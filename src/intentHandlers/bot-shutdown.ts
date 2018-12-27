import { randomElementFromArray } from "../helpers";
import { CommunicationEvent } from "../types";

export function handler(eventData: CommunicationEvent) {
    eventData.responseCallback(randomElementFromArray(eventData.config.responses));
    eventData.bot.processes.filter(process => process.active).forEach((process) => {
        process.stop();
    });
    setTimeout(() => {
        eventData.client.destroy();
    }, eventData.config.handlerSpecific.shutdownDelay)
}