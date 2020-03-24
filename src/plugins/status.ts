import { createServer, Server } from "http";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class StatusPlugin extends Plugin<{}> {
	private context: DiscordBot;
	private server: Server;

	inject(context: DiscordBot): void {
		if (context.client.shard?.ids.indexOf(0) == -1) return;

		this.context = context;

		this.server = createServer(async (req, res) => {
			res.statusCode = 200;
			res.setHeader("content-type", "application/json");

			res.end(
				JSON.stringify({
					username: this.context.client.user.tag,
					guildcount: await this.context.client.shard.broadcastEval("this.guilds.cache.size").then((results) => results.reduce((accum, cur) => accum + cur, 0)),
				})
			);
		}).listen(8080);
	}

	extract(): void {
		console.log("nothing");

		this.server.close();
	}
}
