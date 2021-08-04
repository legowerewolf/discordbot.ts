# Discordbot.js

![GitHub package.json version](https://img.shields.io/github/package-json/v/legowerewolf/discordbot.ts)
![License](https://img.shields.io/github/license/legowerewolf/discordbot.ts)
[![Docs](https://img.shields.io/badge/docs-Typedoc-purple)](https://legowerewolf.github.io/discordbot.ts/)
[![David - Dependency Checking](https://img.shields.io/david/legowerewolf/discordbot.ts?label=npm%20dependencies)](https://david-dm.org/legowerewolf/discordbot.ts)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/legowerewolf/discordbot.ts/Testing?label=testing)](https://github.com/legowerewolf/discordbot.ts/actions?query=workflow%3ATesting)

A simple way to add natural-language-powered Discord bots to your server.

## Present status and future plans

Work's currently halted. Kinda ran out of ideas.

When `discord.js` v13 drops, I'm planning a near-full rewrite. Anticipated
externally-visible changes include:

-   Dropping natural-language input in favor of Slash Commands
    -   this includes non-useful "commands" like saying hello and such
-   Updating the automatic game-role feature
    -   addition of per-server settings (and commands for controlling them)
        -   enable/disable
        -   custom prefixes
-   Updating the automatic temporary-voice-channel feature
    -   addition of per-server settings (and commands for controlling them)
        -   enable/disable "instance" management (for channels with the
            name-pattern "some name \[number\]")
        -   enable/disable manual temporary channels (channels spawned from a
            command)
    -   Switch to Slash Commands for manual creation

Internally, I want to:

-   Update the interface for settings-storage plugins
-   Clean up docker image builds
    -   Use GitHub Actions to build them
    -   Use GitHub Packages to host them
-   Switch to Yarn for dependency management
-   Mitigate occasional desync between desired and actual state for game-role
    and temporary-voice-channel features
    -   Occasionally, stuff doesn't apply in the right order because of
        inconsistency of API call timing and ordering, resulting in the server
        not ending up in the right state.
    -   This is most obvious as a list of empty game roles stacking up because
        they're not being cleaned up right.
    -   I see a couple of ways forward with this:
        1. Implement queueing on a per-server basis for API actions. Queues
           shouldn't stack up that much - at most I expect to see a few seconds
           of delay if there's a lot of things to do. This will guarantee that
           actions execute in an expected order, and I _think_ it's what I need,
           but I need to reason about it more.
        2. Implement a scheduled janitorial process which goes through and fixes
           the state periodically. This would be easier to implement (and could
           even be implemented first) but isn't quite as elegant a solution.
        3. A combination of the above?

## Implementation

[![Install official bot](https://img.shields.io/badge/Luna-install-7289DA)](https://discordapp.com/api/oauth2/authorize?client_id=461740393353183253&permissions=68624&scope=bot)
![Status](https://img.shields.io/website?label=Luna&url=https%3A%2F%2F7f4e78789c2826ebbf847eb267d7353b.balena-devices.com%2F)

Luna is this repository's official Discord bot. She's configured with all the
default options as specified in this repository, and is nearly always online.

## Setup

If you want to build and run from source:

1. `git clone` the repo.
1. `npm i` to install all dependencies, and `npm run build` to build.
1. Configure (see below)
1. `npm start` to run your bot!

Alternately, compose a Dockerfile depending on the
[official images](https://hub.docker.com/r/legowerewolf/discordbot.ts). It's not
recommended to use `:latest`.

```dockerfile
FROM legowerewolf/discordbot.ts:latest
COPY ./config.yaml ./config/
ENTRYPOINT [ "npm", "start" ]
```

### Configuration

Bots support YAML v1.2/JSON for configuration.

Check out the commented defaults in `./config/defaults.yaml`.

User configurations go in `./config/config.yaml` or an environment var called
`botConfig`.

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

-   Unit tests, holy crap. Worry about the little stuff, there's not much to be
    done for stuff depending on API data or the state of the whole bot. That
    said, if you can tell me how to mock the Discord API to run tests, please
    make an issue so we can discuss it.
