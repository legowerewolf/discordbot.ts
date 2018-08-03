export interface ChatbaseMessageStatus {
    getCreateResponse: Function;
}

export function handleMessageResponse(msg: ChatbaseMessageStatus) {
    let resp = msg.getCreateResponse();
    if (resp.status != 200) { console.log(`Error on message: ${msg}`) }
}