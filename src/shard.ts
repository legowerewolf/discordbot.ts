import { DiscordBot } from "./discordbot";
import { injectErrorLogger, parseConfig } from "./helpers";

injectErrorLogger();
parseConfig().then((config) => {
	new DiscordBot(config).start();
});
