import { Client, Guild, Message, User } from "discord.js";
import { DiscordBot } from "./DiscordBot";
import { IntentData } from "./IntentData";
import { ResponseCallback } from "./ResponseCallback";
export interface CommunicationEvent {
	text: string;
	responseCallback: ResponseCallback;
	author: User;
	guild: Guild;
	client: Client;
	source: string;
	messageObject?: Message;
	config?: IntentData;
	bot?: DiscordBot;
}
