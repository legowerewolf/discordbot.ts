import { readFile } from 'fs';
import { safeLoad } from 'js-yaml';
import { promisify } from 'util';
import { DiscordBot } from './discordbot';
import { ConfigElement, IntentsResolutionMethods } from './types';

const readFileP = promisify(readFile);

Promise.all([
    readFileP("./config/defaults.json"),
    readFileP("./config/config.json")
        .catch(() => {
            if (process.env.BotConfig) return Buffer.from(process.env.BotConfig);
            else throw new Error("Required custom configuration not found. Create a config file or provide via environment variable.");
        })
])
    .then((data) => {
        let defaultConfig: ConfigElement = safeLoad(data[0].toString());
        let customConfig: ConfigElement[] = safeLoad(data[1].toString()).instances;

        if (customConfig === undefined) throw new Error("Malformed configuration data.")

        customConfig.forEach((element: ConfigElement) => {
            let config = { ...defaultConfig, ...element }; // Merge preferring external data

            config.intents = (() => {
                switch (element.intentsResolutionMethod) {
                    default: return defaultConfig.intents;
                    case IntentsResolutionMethods.UseCustom: return element.intents;
                    case IntentsResolutionMethods.Concatenate: return [...defaultConfig.intents, ...element.intents];
                }
            })();

            let bot = new DiscordBot(config);
            bot.start();

        });
    })