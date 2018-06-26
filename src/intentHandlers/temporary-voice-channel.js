const helpers = require("../helpers");

module.exports = {
    handler: function (data) {
        var chosenName = helpers.randomElementFromArray(data.config.channelNames)
        data.guild.createChannel(chosenName, "voice").then((voiceChannel) => {
            voiceChannel.setBitrate(data.config.bitrate);
            var intervalChecker = setInterval(() => {
                if (voiceChannel.members.size == 0) {
                    clearInterval(intervalChecker);
                    voiceChannel.delete();
                }
            }, data.config.interval);
        });
    }
}