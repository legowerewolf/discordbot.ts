import * as Fs from 'fs';
import { DiscordBot } from './discordbot';
import { ConfigElement } from './types';


Fs.readFile("./config/defaults.json", function (err, defaultData) {
    if (err) throw err;
    Fs.readFile("./config/config.json", function (err, customData) {
        if (err) throw err;
        var defaultConfig: ConfigElement = JSON.parse(defaultData.toString());
        var customConfig = JSON.parse(customData.toString());

        if (!customConfig.instances) {
            customConfig = { instances: [customConfig] };
        }

        customConfig.instances.forEach((element: ConfigElement) => {
            var config = Object.assign({}, defaultConfig, element);
            config.intents = element.intents ? defaultConfig.intents.concat(element.intents) : defaultConfig.intents;
            var bot = new DiscordBot(config);
            bot.start();
        });

    });
});