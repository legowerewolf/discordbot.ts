import fetch from "node-fetch";
import { DiscordBot } from "../discordbot";
import { randomElementFromArray } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class StandardHandlers extends Plugin {
    inject(context: DiscordBot) {
        context.handlers = {
            ...context.handlers,
            basic_response: (eventData: CommunicationEvent) => {
                eventData.responseCallback(randomElementFromArray(eventData.config.responses));
            },
            ip_finder: (eventData: CommunicationEvent) => {
                fetch("http://ip-api.com/json")
                    .then((response) => response.json())
                    .then((text) => {
                        eventData.responseCallback(`your IP address is ${text.query}.`)
                    });
            },
            bot_shutdown: (eventData: CommunicationEvent) => {
                eventData.responseCallback(randomElementFromArray(eventData.config.responses));
                eventData.bot.client.emit('destroy');
                setTimeout(() => {
                    eventData.client.destroy();
                }, eventData.config.handlerSpecific.shutdownDelay)
            }
        }
    }
}