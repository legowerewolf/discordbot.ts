import { injectErrorLogger, parseConfig } from "./helpers/helpers";
import { DiscordBot } from "./typedef/DiscordBot";

injectErrorLogger();
parseConfig().then((config) => {
	new DiscordBot(config).start();
});
