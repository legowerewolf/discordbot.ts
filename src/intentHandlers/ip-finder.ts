import fetch from 'node-fetch';
import { CommunicationEvent } from "../types";

export function handler(eventData: CommunicationEvent) {
    fetch("http://ip-api.com/json")
        .then((response) => response.json())
        .then((text) => {
            eventData.responseCallback(`your IP address is ${text.query}.`)
        });
}