import { MessageSubscriber, SubscriberMessage, SubscriberMessageSources } from "../types";

export interface ChatbaseMessageStatus {
    getCreateResponse: Function;
}

export function handleMessageResponse(msg: ChatbaseMessageStatus) {
    let resp = msg.getCreateResponse();
    //if (resp.status != 200) { console.log(`Error on message: ${msg}`) }
    console.log(`Message push status: ${resp.status}`)
}

export class ChatbaseSubscriber implements MessageSubscriber {
    chatbaseInstance: any;

    constructor(apikey: string) {
        this.chatbaseInstance = require('@google/chatbase').setApiKey(apikey).setPlatform("Discord");
    }

    handleMessage(message: SubscriberMessage) {
        let chatbaseMessage: any = this.chatbaseInstance.newMessage()
            .setUserId(message.user)
            .setMessage(message.message);


        if (message.source = SubscriberMessageSources.bot) {
            chatbaseMessage.setAsTypeAgent();
        } else {
            chatbaseMessage.setAsTypeUser();
        }

        if (message.intent) {
            chatbaseMessage.setIntent(message.intent);
        }

        if (message.failure) {
            chatbaseMessage.setAsNotHandled();
        } else {
            chatbaseMessage.setAsHandled();
        }

        chatbaseMessage.send().then((msg: ChatbaseMessageStatus) => handleMessageResponse(msg));
    }
}