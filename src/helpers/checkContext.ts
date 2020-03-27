import { CommunicationEvent } from "../typedef/CommunicationEvent";
export function checkContext(context: "server" | "dm", handler: (e: CommunicationEvent) => void) {
	return (event: CommunicationEvent): void => {
		if (context == "server" && !event.guild) {
			event.responseCallback(`I can't do that in this context. You must be in a server.`);
			return;
		}
		if (context == "dm" && event.source != "dm") {
			event.responseCallback(`I can't do that in this context. You must DM me.`);
			return;
		}
		handler(event);
	};
}
