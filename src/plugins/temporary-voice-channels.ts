import { GuildMember, VoiceChannel } from 'discord.js';
import { DiscordBot } from '../discordbot';
import { randomElementFromArray, responseToQuestion } from '../helpers';
import { CommunicationEvent, Plugin } from "../types";

export default class TemporaryVoiceChannel extends Plugin {
    inject(context: DiscordBot) {
        context.handlers = {
            ...context.handlers,
            temporary_voice_channel: (eventData: CommunicationEvent) => {
                responseToQuestion(eventData)
                    .then((chosenName: string) => eventData.guild.createChannel(chosenName, "voice"))
                    .then((newC: VoiceChannel) => {
                        newC.setBitrate(eventData.config.handlerSpecific.bitrate);

                        eventData.responseCallback(randomElementFromArray(eventData.config.responses) + newC.name);

                        newC.guild.member(eventData.author).setVoiceChannel(newC).catch((err) => console.error(err));

                        const events = ['voiceStateUpdate', 'destroy'];

                        let listenerFunc = function (...args: GuildMember[]) {
                            if (args.length == 2) { // Event is 'voiceStateUpdate'
                                if (args[0].voiceChannelID == newC.id && newC.members.size == 0) {
                                    newC.delete();

                                    events.map((event) => eventData.bot.client.off(event, listenerFunc));
                                }
                            } else { // Event is 'destroy'
                                newC.delete();
                            }
                        }

                        events.map((event) => eventData.bot.client.on(event, listenerFunc));

                    })
            }
        }
    }
}