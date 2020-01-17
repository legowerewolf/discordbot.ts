import { ShardingManager } from "discord.js";
import ratlog, { RatlogData } from "ratlog";
import "source-map-support/register";
import { injectErrorLogger, parseConfig } from "./helpers";

const log = ratlog(process.stdout);
injectErrorLogger();

parseConfig().then((config) => {
	const manager = new ShardingManager(`./build/shard.js`, {
		totalShards: "auto",
		token: config.APIKeys.discord,
	});

	// @ts-ignore - these values are filled in at build time.
	log(`Starting shard manager...`, { version: META_VERSION, commit: META_HASH }, "manager", "info");

	manager.spawn();

	manager.on("shardCreate", (shard) => {
		log(`Launched shard...`, { shardID: shard.id }, "manager", "info");

		shard.on("message", (message: RatlogData) => {
			log.tag(`shard_${shard.id}`)(message.message, { ...message.fields }, ...message.tags);
		});
	});
});
