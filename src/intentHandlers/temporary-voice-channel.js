const helpers = require("../helpers");

module.exports = {
    handler: function (eventData) {
        helpers.responseToQuestion(eventData, {
            question: "Alright, what do you want to name it?",
            questionAnswered: "Alright, that's what I'll call it.",
            questionTimeout: "Never mind. I'll pick a name.",
            callback: (chosenName) => {
                chosenName = chosenName ? chosenName : helpers.randomElementFromArray(eventData.config.channelNames); // If chosenName is unset, set it to a random name
                eventData.guild.createChannel(chosenName, "voice").then((voiceChannel) => {
                    voiceChannel.setBitrate(eventData.config.bitrate);
                    eventData.responseCallback(helpers.randomElementFromArray(eventData.config.responses) + chosenName)
                    var intervalChecker = setInterval(() => {
                        if (voiceChannel.members.size == 0) {
                            clearInterval(intervalChecker);
                            voiceChannel.delete();
                        }
                    }, eventData.config.checkForMembersInterval);
                });
            }
        });
    }
}