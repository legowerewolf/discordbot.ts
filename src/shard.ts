import { injectErrorLogger } from "./helpers/injectErrorLogger";
import { parseConfig } from "./helpers/parseConfig";
import { DiscordBot } from "./typedef/DiscordBot";

injectErrorLogger();
parseConfig().then((config) => {
	new DiscordBot(config).start();
});
