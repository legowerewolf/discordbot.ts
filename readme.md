# Discordbot.js

![](https://img.shields.io/travis/legowerewolf/discordbot.js.svg?style=flat-square)

A simple way to add natural-language-powered Discord bots to your server.

## Setup

1. `npm i` to install all dependencies.
1. `npm test` to build and test everything.
1. Compose your configuration, then write it to `./config/config.yaml` or an environment var called `botConfig`.
1. `npm start` to start up your bot(s)!

### Configuration

Bots support YAML 1.2 for configuration. 

Check out the commented defaults in `./config/defaults.yaml`.

### Permissions

With all features and plugins, the bot needs the following permissions to run.

* Manage Channels
* View Channels
* Send Messages
* Read Message History

## Contributing

Things that need to get done:
* Unit tests, holy crap. Worry about the little stuff, there's not much to be done for stuff depending on API data or the state of the whole bot.

## License

This project is licensed under the GPLv3 licence.
