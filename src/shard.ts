import { injectErrorLogger, parseConfig } from "./helpers";
import { DiscordBot } from "./typedef/DiscordBot";

injectErrorLogger();
parseConfig().then((config) => {
	new DiscordBot(config).start();
});
