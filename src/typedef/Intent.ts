import { PermissionString } from "discord.js";
import { IntentData } from "./IntentData";

export interface Intent {
	/** Human-readable name for the intent */
	name?: string;

	/** Human-readable description */
	description?: string;

	/** Array of training messages to invoke this intent */
	models: Array<string>;

	/** Name of intent to invoke */
	handler: string;

	data?: IntentData;
	accessPermissions: PermissionString[];
}
