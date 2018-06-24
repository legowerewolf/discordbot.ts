const Fs = require('fs');
const Discord = require('discord.js');
const Brain = require('./brain');

Fs.readFile("./config/defaults.json", function (err, defaultData) {
    if (err) throw err;
    Fs.readFile("./config/config.json", function (err, data) {
        if (err) throw err;
        var defaultConfig = JSON.parse(defaultData);
        var customConfig = JSON.parse(data);

        if (!customConfig.instances) {
            customConfig = { instances: [customConfig] };
        }

        customConfig.instances.forEach(element => {
            var config = Object.assign(defaultConfig, element);
            prefixer.configure(config.shortname);
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
            var intent = brain.interpret(msg.cleanContent).label;
            var responses = config.intents[config.intents.map(i => i.name).indexOf(intent)].responses;
            msg.reply(getRandomText(responses));
        }
    });

    client.on('ready', () => {
        prefixer.log(config.shortname, `Logged in as ${client.user.tag}! ID: ${client.user.id}`);
    });

    client.login(config.APIKeys.discord);
}

var prefixer = {
    maxLength: 0,
    log: function (name, message) {
        var prefix = "[" + name + "]";
        prefix += " ".repeat(this.maxLength - prefix.length);
        console.log(prefix + message);
    },
    configure: function (name) {
        if (name.length + 3 > this.maxLength) {
            this.maxLength = name.length + 3;
        }
    }
};

function getRandomText(array) {
    return array[Math.floor(Math.random() * array.length)];
}