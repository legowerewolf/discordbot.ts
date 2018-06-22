const fs = require('fs');
const discord = require('discord.js');

var prefixLength = 0;
function log(name, message) {
    var prefix = "[" + name + "]";
    prefix += " ".repeat(prefixLength - prefix.length)
    console.log(prefix + message)
}

fs.readFile("./config/defaults.json", function (err, defaultData) {
    if (err) throw err;
    fs.readFile("./config/config.json", function (err, data) {
        if (err) throw err;
        var defaultConfig = JSON.parse(defaultData);
        var customConfig = JSON.parse(data);

        if (!customConfig.instances) {
            customConfig = { instances: [customConfig] };
        }

        customConfig.instances.forEach(element => {
            var config = Object.assign(defaultConfig, element);
            if (config.shortname.length + 3 > prefixLength) { prefixLength = config.shortname.length + 3; }
            startBotInstance(config);
        });

    });
});

async function startBotInstance(config) {
    var client = new discord.Client();

    client.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
    });

    client.on('ready', () => {
        log(config.shortname, `Logged in as ${client.user.tag}! ID: ${client.user.id}`);
    });

    client.login(config.APIKeys.discord);
}