import * as Discord from 'discord.js';
import * as Fs from 'fs';
import { Brain } from './brain';
import { ChatbaseMessageStatus, handleMessageResponse } from './chatbasehelpers';
import { CommunicationEvent, ConfigElement } from './types';

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
            prefixer.prepare(config.shortname);
            startBotInstance(config);
        });

    });
});

async function startBotInstance(config: ConfigElement) {
    var brain = new Brain();
    config.intents.forEach((intent) => {
        brain.teach(intent.models, intent.name);
    });
    brain.train();

    var client = new Discord.Client();
    var chatbase = config.APIKeys.chatbase ? require('@google/chatbase').setApiKey(config.APIKeys.chatbase).setPlatform("Discord") : undefined;

    client.on('message', msg => {
        if (msg.author.id != client.user.id && msg.mentions.users.has(client.user.id)) {
            handleInput({
                text: msg.cleanContent,
                responseCallback: (response: string) => { msg.reply(response) },
                author: msg.author,
                guild: msg.guild,
                client: client,
                source: "text",
                // Text message only data
                messageObject: msg
            });
        }
    });

    client.on('ready', () => {
        prefixer.log(config.shortname, `Logged in as ${client.user.tag}! ID: ${client.user.id}`);
    });

    client.login(config.APIKeys.discord);

    function handleInput(eventData: CommunicationEvent) {
        var intent = config.intents[config.intents.map(i => i.name).indexOf(brain.interpret(eventData.text).label)];

        eventData.config = intent.data;
        if (chatbase) {
            chatbase.newMessage().setAsTypeUser().setUserId(eventData.author.id).setMessage(eventData.text).setIntent(intent.name).send().then((msg: ChatbaseMessageStatus) => handleMessageResponse(msg));

            eventData.responseCallbackOrig = eventData.responseCallback;
            eventData.responseCallback = (response: string) => {
                chatbase.newMessage().setAsTypeAgent().setUserId(eventData.author.id).setMessage(response).send().then((msg: ChatbaseMessageStatus) => handleMessageResponse(msg));
                eventData.responseCallbackOrig(response);
            };
            eventData.chatbaseRelay = (message: string) => { chatbase.newMessage().setAsTypeUser().setUserId(eventData.author.id).setMessage(message).send().then((msg: ChatbaseMessageStatus) => handleMessageResponse(msg)); };

        }

        if (!intent.permissionLevel || config.users[eventData.author.id].permissionLevel >= intent.permissionLevel) {
            if (intent.handler) { // If an intent handler is explicitly provided
                require("./intentHandlers/" + intent.handler).handler(eventData);
            } else { // Run the handler matching the intent name
                require("./intentHandlers/" + intent.name).handler(eventData);
            }
        } else {
            eventData.responseCallback("You don't have permission to ask that.");
        }
    }
}

var prefixer = {
    maxLength: 0,
    log: function (name: string, message: string) {
        var prefix = "[" + name + "]";
        prefix += " ".repeat(this.maxLength - prefix.length);
        console.log(prefix + message);
    },
    prepare: function (name: string) {
        if (name.length + 3 > this.maxLength) {
            this.maxLength = name.length + 3;
        }
    }
};