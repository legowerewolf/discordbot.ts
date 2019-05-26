import { readFile } from "fs";
import { safeLoad } from "js-yaml";
import { promisify } from "util";
import { DiscordBot } from "./discordbot";
import { ConfigElement, IntentsMap, IntentsResolutionMethods } from "./types";

const readFileP = promisify(readFile);

const intentResolver: Map<IntentsResolutionMethods, (defaults: IntentsMap, custom: IntentsMap) => IntentsMap> = new Map([
	[IntentsResolutionMethods.UseDefault, (defaults: IntentsMap, custom: IntentsMap) => defaults],
	[IntentsResolutionMethods.UseCustom, (defaults: IntentsMap, custom: IntentsMap) => custom],
	[
		IntentsResolutionMethods.MergePreferCustom,
		(defaults: IntentsMap, custom: IntentsMap) => {
			return { ...defaults, ...custom };
		},
	],
	[
		IntentsResolutionMethods.MergePreferDefault,
		(defaults: IntentsMap, custom: IntentsMap) => {
			return { ...custom, ...defaults };
		},
	],
]);

Promise.all([
	readFileP("./config/defaults.yaml"),
	readFileP("./config/config.yaml").catch(() => {
		if (process.env.BotConfig) return Buffer.from(process.env.BotConfig);
		else throw new Error("Required custom configuration not found. Create a config file or provide via environment variable.");
	}),
]).then((data) => {
	let defaultConfig: ConfigElement = safeLoad(data[0].toString());
	let customConfig: ConfigElement = safeLoad(data[1].toString());

	if (customConfig === undefined) throw new Error("Malformed configuration data.");

	let resolvedConfig = { ...defaultConfig, ...customConfig }; // Merge preferring custom data

	resolvedConfig.intents = intentResolver.get(resolvedConfig.intentsResolutionMethod)(defaultConfig.intents, customConfig.intents);

	new DiscordBot(resolvedConfig).start();
});
