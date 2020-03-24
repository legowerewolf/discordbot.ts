import { ShardingManager } from "discord.js";
import ratlog, { RatlogData } from "ratlog";
import "source-map-support/register";
import { META_HASH, META_VERSION } from "./helpers/helpers";
import { injectErrorLogger } from "./helpers/injectErrorLogger";
import { parseConfig } from "./helpers/parseConfig";

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

		const handlers = {
			log: (data: RatlogData): void => log.tag(`shard_${shard.id}`)(data.message, { ...data.fields }, ...data.tags),
		};

		shard.on("message", (message: { type: keyof typeof handlers; data: never }) => {
			if (message.type) handlers[message.type](message.data);
		});
	});
});
