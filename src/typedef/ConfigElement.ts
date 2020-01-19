import { IntentsMap } from "./IntentsMap";
import { IntentsResolutionMethods } from "./IntentsResolutionMethods";
export interface ConfigElement {
	logLevel: number;
	defaultPermissionLevel: number;
	APIKeys: {
		discord: string;
		chatbase?: string;
	};
	users?: {
		[key: string]: {
			permissionLevel: number;
		};
	};
	intentsResolutionMethod: IntentsResolutionMethods;
	intents: IntentsMap;
	plugins: {
		[key: string]: any;
	};
}
