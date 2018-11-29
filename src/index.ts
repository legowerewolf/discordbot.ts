import * as Fs from 'fs';
import { DiscordBot } from './discordbot';
import { ConfigElement } from './types';
import { update } from './update';

update().then((result) => {

    Fs.readFile("./config/defaults.json", function (err, defaultData) {
        if (err) throw err;

        Fs.readFile("./config/config.json", function (err, customData) {
            if (err) {
                if (process.env.BotConfig) {
                    customData = Buffer.from(process.env.BotConfig);
                } else { throw err; }
            }

            let defaultConfig: ConfigElement = JSON.parse(defaultData.toString());
            let customConfig = JSON.parse(customData.toString());

            if (!customConfig.instances) {
                customConfig = { instances: [customConfig] };
            }

            customConfig.instances.forEach((element: ConfigElement) => {
                let config = { ...defaultConfig, ...element };
                config.intents = element.intents ? defaultConfig.intents.concat(element.intents) : defaultConfig.intents;
                let bot = new DiscordBot(config);
                bot.start();
            });

        });
    });

});