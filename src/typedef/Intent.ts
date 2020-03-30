import { PermissionString } from "discord.js";
import { IntentData } from "./IntentData";

export interface Intent {
	name?: string; // Human-readable name for the intent
	description?: string; // Human-readable description
	models: Array<string>; // Array of training messages to invoke this intent
	handler: string; // Name of intent to invoke
	data?: IntentData;
	accessPermissions: PermissionString[];
}
