import { createServer, Server } from "http";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

interface Config {
	port: number;
}

/**
 * Starts a web server serving basic JSON data about the bot.
 */
export default class StatusPlugin extends Plugin<Config> {
	private context: DiscordBot;
	private server: Server;

	static defaultConfig = {
		port: 8080,
	};

	inject(context: DiscordBot): void {
		if (context.client.shard?.ids.indexOf(0) == -1) return;

		this.context = context;

		this.server = createServer(async (req, res) => {
			res.statusCode = 200;
			res.setHeader("content-type", "application/json");
			res.end(
				JSON.stringify({
					username: this.context.client.user?.tag,
					guildcount: await this.context.client.shard.broadcastEval(`this.guilds.cache.size`).then((results) => results.reduce((accum, cur) => accum + cur, 0)),
				})
			);
		}).listen(this.config.port);
	}

	extract(): void {
		console.log("nothing");

		this.server.close();
	}
}
