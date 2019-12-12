import { ShardingManager } from "discord.js";
import { defaultPrefixer, errorLevelPrefixer, ErrorLevels } from "legowerewolf-prefixer";
import "source-map-support/register";
import { injectErrorLogger, parseConfig } from "./helpers";

injectErrorLogger();

parseConfig().then((config) => {
	let manager = new ShardingManager(`./build/shard.js`, {
		totalShards: "auto",
		token: config.APIKeys.discord,
	});

	defaultPrefixer.update("MANAGER");

	// @ts-ignore - these values are filled in at build time.
	console.log(defaultPrefixer.prefix("MANAGER", errorLevelPrefixer.prefix(ErrorLevels.Info, `Starting shard manager for v${META_VERSION} / ${META_HASH}`)));

	manager.spawn();

	manager.on("shardCreate", (shard) => {
		defaultPrefixer.update(`Shard ${shard.id}`);
		console.log(defaultPrefixer.prefix("MANAGER", errorLevelPrefixer.prefix(ErrorLevels.Info, `Launched shard ${shard.id}...`)));

		shard.on("message", (message) => {
			console.log(defaultPrefixer.prefix(`Shard ${shard.id}`, message));
		});
	});
});
