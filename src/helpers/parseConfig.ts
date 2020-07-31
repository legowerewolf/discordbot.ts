import { safeLoad } from "js-yaml";
import { ConfigElement } from "../typedef/ConfigElement";
import { Intent } from "../typedef/Intent";
import { readFileP, resolveConflict } from "./helpers";

export function parseConfig(): Promise<ConfigElement> {
	return Promise.all([
		readFileP("./config/defaults.yaml"),
		readFileP("./config/config.yaml").catch(() => {
			if (process.env.BotConfig) return Buffer.from(process.env.BotConfig);
			else throw new Error("Required custom configuration not found. Create a config file or provide via environment variable.");
		}),
	]).then((data) => {
		const defaultConfig: ConfigElement = safeLoad(data[0].toString()) as ConfigElement;
		const customConfig: ConfigElement = safeLoad(data[1].toString()) as ConfigElement;
		if (customConfig === undefined) throw new Error("Malformed configuration data.");
		const resolvedConfig = { ...defaultConfig, ...customConfig }; // Merge preferring custom data
		resolvedConfig.intents = resolveConflict<Intent>(resolvedConfig.intentsResolutionMethod, defaultConfig.intents, customConfig.intents);
		resolvedConfig.plugins = resolveConflict<any>(resolvedConfig.pluginsResolutionMethod, defaultConfig.plugins, customConfig.plugins);
		return resolvedConfig;
	});
}
