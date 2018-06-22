const fs = require('fs');
const discord = require('discord.js');


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
            if (config.shortname.length + 3 > prefixer.maxLength) { prefixer.maxLength = config.shortname.length + 3; }
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
        prefixer.log(config.shortname, `Logged in as ${client.user.tag}! ID: ${client.user.id}`);
    });

    client.login(config.APIKeys.discord);
}

var prefixer = {
    maxLength: 0,
    log: function(name, message) {
        var prefix = "[" + name + "]";
        prefix += " ".repeat(this.maxLength - prefix.length);
        console.log(prefix + message);
    }
};