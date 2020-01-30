# Discordbot.js

[![David - Dependency Checking](https://img.shields.io/david/legowerewolf/discordbot.ts?label=npm%20dependencies)](https://david-dm.org/legowerewolf/discordbot.ts)
[![Github Actions - Testing](https://github.com/legowerewolf/discordbot.ts/workflows/Testing/badge.svg?branch=master)](https://github.com/legowerewolf/discordbot.ts/actions?query=workflow%3ATesting)
[![Docker Cloud - Container Build Status](https://img.shields.io/docker/cloud/build/legowerewolf/discordbot.ts)](https://hub.docker.com/r/legowerewolf/discordbot.ts)

A simple way to add natural-language-powered Discord bots to your server.

## Implementation

[Luna](https://discordapp.com/api/oauth2/authorize?client_id=461740393353183253&permissions=68624&scope=bot) is this repository's official Discord bot.

## Setup

1. `npm i` to install all dependencies.
1. Configure (see below)
1. `npm start` to start up your bot(s)!

### Configuration

Bots support YAML v1.2/JSON for configuration.

Check out the commented defaults in `./config/defaults.yaml`.

User configurations go in `./config/config.yaml` or an environment var called `botConfig`.

#### Minimum viable configuration

```YAML
---
APIKeys:
    discord: [API key here]
```

### Permissions

With all features and plugins, the bot needs the following permissions to run.

-   Manage Channels
-   View Channels
-   Send Messages
-   Read Message History

## Contributing

Things that need to get done:

-   Unit tests, holy crap. Worry about the little stuff, there's not much to be done for stuff depending on API data or the state of the whole bot. That said, if you can tell me how to mock the Discord API to run tests, please make an issue
    so we can discuss it.

## License

This project is licensed under the GPLv3 licence.
