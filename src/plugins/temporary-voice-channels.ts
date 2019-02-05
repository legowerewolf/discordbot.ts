import { VoiceChannel } from 'discord.js';
import { DiscordBot } from '../discordbot';
import { randomElementFromArray, responseToQuestion } from '../helpers';
import { CommunicationEvent, OngoingProcess, Plugin } from "../types";

export default class TemporaryVoiceChannel extends Plugin {
    inject(context: DiscordBot) {
        context.handlers = {
            ...context.handlers,
            temporary_voice_channel: (eventData: CommunicationEvent) => {
                responseToQuestion(eventData)
                    .then((chosenName: string) => {
                        let tempVC = createTempVoiceChannel(chosenName, eventData);
                        tempVC.start();
                        eventData.bot.registerOngoingProcess(tempVC);
                    });
            }
        }
    }
}

function createTempVoiceChannel(newChannel: string, eventData: CommunicationEvent): OngoingProcess {
    return {
        active: true,
        data: {},
        start: function () {
            eventData.guild.createChannel(newChannel, "voice")
                .then((voiceChannel: VoiceChannel) => {
                    voiceChannel.setBitrate(eventData.config.handlerSpecific.bitrate);

                    eventData.responseCallback(randomElementFromArray(eventData.config.responses) + newChannel);

                    voiceChannel.guild.member(eventData.author).setVoiceChannel(voiceChannel).catch((err) => console.error(err));

                    this.data.voiceChannel = voiceChannel;
                    this.data.intervalChecker = setInterval(() => {
                        if (voiceChannel.members.size == 0) {
                            this.stop();
                        }
                    }, eventData.config.handlerSpecific.checkForMembersInterval);
                });
        },
        stop: function () {
            clearInterval(this.data.intervalChecker);
            this.data.voiceChannel.delete();
            this.active = false;
        }
    } as OngoingProcess;
}