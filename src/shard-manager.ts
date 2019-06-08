import { ShardingManager } from "discord.js";
import { parseConfig } from "./helpers";

parseConfig().then((config) => {
	let manager = new ShardingManager(`./build/shard.js`, {
		totalShards: "auto",
		token: config.APIKeys.discord,
	});

	manager.spawn();
});
