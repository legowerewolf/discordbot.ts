# Discordbot.js

![David](https://img.shields.io/david/legowerewolf/discordbot.ts?label=npm%20dependencies)
[![Travis (.org)](https://img.shields.io/travis/legowerewolf/discordbot.ts?label=travis%20build)](https://travis-ci.org/legowerewolf/discordbot.ts)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/legowerewolf/discordbot.ts)](https://hub.docker.com/r/legowerewolf/discordbot.ts)

A simple way to add natural-language-powered Discord bots to your server.

## Setup

1. `npm i` to install all dependencies.
1. Compose your configuration, then write it to `./config/config.yaml` or an environment var called `botConfig`.
1. `npm start` to start up your bot(s)!

### Configuration

Bots support YAML v1.2/JSON for configuration.

Check out the commented defaults in `./config/defaults.yaml`.

### Permissions

With all features and plugins, the bot needs the following permissions to run.

-   Manage Channels
-   View Channels
-   Send Messages
-   Read Message History

## Contributing

Things that need to get done:

-   Unit tests, holy crap. Worry about the little stuff, there's not much to be done for stuff depending on API data or the state of the whole bot.

## License

This project is licensed under the GPLv3 licence.
