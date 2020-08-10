import { createServer, Server } from "http";
import { Plugin } from "../typedef/Plugin";

interface Config {
	port: number;
}

/**
 * Starts and hosts a web server serving basic JSON data about the bot.
 */
export default class StatusPlugin extends Plugin<Config> {
	private server: Server;

	static defaultConfig = {
		port: 8080,
	};

	inject(): void {
		// Only run the server on shard 0, to prevent weird networking shit.
		if (this.context.client.shard?.ids.indexOf(0) == -1) return;

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
		this.server.close();
	}
}
