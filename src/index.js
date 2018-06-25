const Fs = require('fs');
const Discord = require('discord.js');
const Brain = require('./brain');

Fs.readFile("./config/defaults.json", function (err, defaultData) {
    if (err) throw err;
    Fs.readFile("./config/config.json", function (err, customData) {
        if (err) throw err;
        var defaultConfig = JSON.parse(defaultData);
        var customConfig = JSON.parse(customData);

        if (!customConfig.instances) {
            customConfig = { instances: [customConfig] };
        }

        customConfig.instances.forEach(element => {
            var config = Object.assign({}, defaultConfig, element);
            config.intents = defaultConfig.intents.concat(element.intents);
            prefixer.prepare(config.shortname);
            startBotInstance(config);
        });

    });
});

async function startBotInstance(config) {
    brain = new Brain();
    config.intents.forEach((intent) => {
        brain.teach(intent.models, intent.name);
    });
    brain.train();

    var client = new Discord.Client();

    client.on('message', msg => {
        if (msg.author.id != client.user.id && msg.mentions.users.has(client.user.id)) {
            handleInput(msg.cleanContent, (response) => { msg.reply(response) });
        }
    });

    client.on('ready', () => {
        prefixer.log(config.shortname, `Logged in as ${client.user.tag}! ID: ${client.user.id}`);
    });

    client.login(config.APIKeys.discord);

    function handleInput(text, responseCallback) {
        var intent = config.intents[config.intents.map(i => i.name).indexOf(brain.interpret(text).label)];
        if (intent.hasSpecialHandler) {
            require("./intentHandlers/" + intent.name).handler(responseCallback);
        } else {
            responseCallback(getRandomText(intent.responses));
        }
    }
}

var prefixer = {
    maxLength: 0,
    log: function (name, message) {
        var prefix = "[" + name + "]";
        prefix += " ".repeat(this.maxLength - prefix.length);
        console.log(prefix + message);
    },
    prepare: function (name) {
        if (name.length + 3 > this.maxLength) {
            this.maxLength = name.length + 3;
        }
    }
};

function getRandomText(array) {
    return array[Math.floor(Math.random() * array.length)];
}