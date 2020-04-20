import { User } from "discord.js";
import { Dictionary } from "./Dictionary";
import { Intent } from "./Intent";
import { ResolutionMethods } from "./ResolutionMethods";

export interface ConfigElement {
	APIKeys: {
		discord: string;
	};
	admins?: Array<User["id"]>;

	intentsResolutionMethod: ResolutionMethods;
	intents: Dictionary<Intent>;

	pluginsResolutionMethod: ResolutionMethods;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: Dictionary<any>;
}
