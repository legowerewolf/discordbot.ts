import { VoiceChannel } from 'discord.js';
import { randomElementFromArray, responseToQuestion } from '../helpers';
import { CommunicationEvent, OngoingProcess } from "../types";


export function handler(eventData: CommunicationEvent) {
    responseToQuestion(eventData, (chosenName: string) => {
        let tempVC = createTempVoiceChannel(chosenName, eventData);
        tempVC.start();
        eventData.bot.registerOngoingProcess(tempVC);
    });
}

function createTempVoiceChannel(newChannel: string, eventData: CommunicationEvent) {
    return {
        active: true,
        data: {},
        start: function () {
            newChannel = newChannel ? newChannel : randomElementFromArray(eventData.config.channelNames); // If chosenName is not set, set it to a random name
            eventData.guild.createChannel(newChannel, "voice")
                .then((voiceChannel: VoiceChannel) => {
                    voiceChannel.setBitrate(eventData.config.bitrate);

                    eventData.responseCallback(randomElementFromArray(eventData.config.responses) + newChannel)

                    this.data.voiceChannel = voiceChannel;
                    this.data.intervalChecker = setInterval(() => {
                        if (voiceChannel.members.size == 0) {
                            this.stop();
                        }
                    }, eventData.config.checkForMembersInterval);
                });
        },
        stop: function () {
            clearInterval(this.data.intervalChecker);
            this.data.voiceChannel.delete();
            this.active = false;
        }
    } as OngoingProcess;
}