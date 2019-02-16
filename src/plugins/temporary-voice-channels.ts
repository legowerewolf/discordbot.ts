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
                    .then((chosenName: string) => eventData.guild.createChannel(chosenName, "voice")) // Make the voice channel
                    .then((channel: VoiceChannel) => Promise.all([
                        Promise.resolve(channel), // The first return will be the channel, garunteed.
                        channel.setBitrate(eventData.config.handlerSpecific.bitrate).catch((err) => console.error(err)), // Fix up the bitrate
                        channel.guild.member(eventData.author).setVoiceChannel(channel).catch((err) => console.error(err)) // Move the user
                    ]))
                    .then((p: any[]) => {
                        let channel = p[0];

                        eventData.responseCallback(randomElementFromArray(eventData.config.responses) + channel.name);

                        const events = ['voiceStateUpdate', 'destroy'];

                        let listenerFunc = function (...args: GuildMember[]) {
                            if (channel.members.size == 0 || eventData.bot.destroy) { // Check and see if the channel is empty.
                                channel.delete();

                                events.map((event) => eventData.bot.client.off(event, listenerFunc));
                            }
                        }


                        setTimeout(() => {
                            listenerFunc();
                            events.map((event) => eventData.bot.client.on(event, listenerFunc));
                        }, eventData.config.handlerSpecific.checkForMembersInterval)

                    })
            }
        }
    }

    extract(context: DiscordBot) { }
}