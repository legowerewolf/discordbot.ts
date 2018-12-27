# Discordbot.js

A simple way to add natural-language-powered Discord bots to your server.

## Setup

1. `npm i` to install all dependencies.
1. `npm test` to build and test everything. \*
1. Compose your configuration, then write it to `./config/config.yaml` or an environment var called `botConfig`.
1. `npm start` to start up your bot(s)!

### Configuration

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

![](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)

This project is released under the terms of the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. In short, what this comes down to is this:

* You may:

  * Share — copy and redistribute the material in any medium or format

  * Adapt — remix, transform, and build upon the material

* You must:

  * Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

  * NonCommercial — You may not use the material for commercial purposes.

  * ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.