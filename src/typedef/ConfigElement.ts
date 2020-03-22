import { Dictionary } from "./Dictionary";
import { Intent } from "./Intent";
import { ResolutionMethods } from "./ResolutionMethods";
export interface ConfigElement {
	logLevel: number;
	APIKeys: {
		discord: string;
		chatbase?: string;
	};
	admins?: string[];
	intentsResolutionMethod: ResolutionMethods;
	intents: Dictionary<Intent>;

	pluginsResolutionMethod: ResolutionMethods;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: Dictionary<any>;
}
