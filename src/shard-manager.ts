import { ShardingManager } from "discord.js";
import ratlog, { RatlogData } from "ratlog";
import "source-map-support/register";
import { injectErrorLogger, META_HASH, META_VERSION, parseConfig } from "./helpers/helpers";

const log = ratlog(process.stdout);
injectErrorLogger();

parseConfig().then(async (config) => {
	const manager = new ShardingManager(`${__dirname}/shard.js`, {
		totalShards: "auto",
		token: config.APIKeys.discord,
	});

	log(`Starting shard manager...`, { version: await META_VERSION, commit: await META_HASH }, "manager", "info");

	manager.spawn();

	manager.on("shardCreate", (shard) => {
		log(`Launched shard...`, { shardID: shard.id }, "manager", "info");

		shard.on("message", (message: RatlogData) => {
			log.tag(`shard_${shard.id}`)(message.message, { ...message.fields }, ...message.tags);
		});
	});
});
