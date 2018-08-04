import { VoiceChannel } from 'discord.js';
import { randomElementFromArray, responseToQuestion } from '../helpers';
import { CommunicationEvent } from "../types";


export function handler(eventData: CommunicationEvent) {
    responseToQuestion(eventData, {
        question: "Alright, what do you want to name it?",
        questionAnswered: "Alright, that's what I'll call it.",
        questionTimeout: "Never mind. I'll pick a name.",

        callback: (chosenName) => {
            chosenName = chosenName ? chosenName : randomElementFromArray(eventData.config.channelNames); // If chosenName is not set, set it to a random name
            eventData.guild.createChannel(chosenName, "voice")
                .then((voiceChannel: VoiceChannel) => {
                    voiceChannel.setBitrate(eventData.config.bitrate);

                    eventData.responseCallback(randomElementFromArray(eventData.config.responses) + chosenName)

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
