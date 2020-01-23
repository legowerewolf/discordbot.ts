import { IntentsMap } from "./IntentsMap";
import { IntentsResolutionMethods } from "./IntentsResolutionMethods";
export interface ConfigElement {
	logLevel: number;
	APIKeys: {
		discord: string;
		chatbase?: string;
	};
	admins?: string[];
	intentsResolutionMethod: IntentsResolutionMethods;
	intents: IntentsMap;
	plugins: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	};
}
