import { VoiceChannel } from "discord.js";
import { DiscordBot } from "../discordbot";
import { randomElementFromArray, responseToQuestion } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

interface ManagedChannel {
	channel: VoiceChannel;
	shutdown: Function;
}

export default class TemporaryVoiceChannel extends Plugin {
	managedChannels: Array<ManagedChannel>;

	constructor() {
		super();

		this.managedChannels = new Array<ManagedChannel>();
		setInterval(() => {
			this.managedChannels = this.managedChannels.filter((managedChannel) => managedChannel.channel.deletable); // Garbage collect the managed channels.
		}, 15000);
	}

	inject(context: DiscordBot) {
		context.handlers["temporary_voice_channel"] = (eventData: CommunicationEvent) => {
			responseToQuestion(eventData)
				.then((chosenName: string) => eventData.guild.createChannel(chosenName, "voice")) // Make the voice channel
				.then((channel: VoiceChannel) =>
					Promise.all([
						Promise.resolve(channel), // The first return will be the channel, garunteed.
						channel.setBitrate(eventData.config.handlerSpecific.bitrate).catch((err) => console.error(err)), // Fix up the bitrate
						channel.guild
							.member(eventData.author)
							.setVoiceChannel(channel)
							.catch((err) => console.error(err)), // Move the user
					])
				)
				.then((p: any[]) => {
					let channel: VoiceChannel = p[0];

					eventData.responseCallback(randomElementFromArray(eventData.config.responses) + channel.name);

					let listenerFunc = function(shutdownOverride = false) {
						if (channel.members.size == 0 || shutdownOverride) {
							// Check and see if the channel is empty.
							channel.delete();

							eventData.bot.client.off("voiceStateUpdate", listenerFunc);
						}
					};

					this.managedChannels.push({
						channel: channel,
						shutdown: listenerFunc,
					});

					setTimeout(() => {
						listenerFunc();
						eventData.bot.client.off("voiceStateUpdate", listenerFunc);
					}, eventData.config.handlerSpecific.checkForMembersInterval);
				});
		};
	}

	extract(context: DiscordBot) {
		this.managedChannels.forEach((channel) => channel.shutdown(true));
	}
}
