import { Client, Guild, Message, User } from "discord.js";
import { DiscordBot } from "./DiscordBot";
import { IntentData } from "./IntentData";
export interface CommunicationEvent {
	text: string;
	responseCallback: (response: string) => Promise<{}>;
	author: User;
	guild: Guild;
	client: Client;
	source: string;
	messageObject?: Message;
	config?: IntentData;
	bot?: DiscordBot;
}
