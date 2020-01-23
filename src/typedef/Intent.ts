import { PermissionString } from "discord.js";
import { IntentData } from "./IntentData";

export interface Intent {
	name?: string; // Human-readable name for the intent
	description: string; // Human-readable description
	models: Array<string>;
	handler: string;
	data?: IntentData;
	accessPermissions: PermissionString[];
}
