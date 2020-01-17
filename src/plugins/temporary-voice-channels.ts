import { VoiceChannel, VoiceState } from "discord.js";
import { DiscordBot } from "../discordbot";
import { responseToQuestion } from "../helpers";
import { CommunicationEvent, Plugin, Vocab } from "../types";

export default class TemporaryVoiceChannel extends Plugin {
	static defaultConfig = {
		name_suffix: "🤖",
	};

	constructor(_config?: any) {
		super(_config);
		this.config.name_regex = new RegExp(`[\\w ]* ${this.config.name_suffix}$`, "g");
	}

	context: DiscordBot;

	inject(context: DiscordBot): void {
		this.context = context;

		context.handlers["temporary_voice_channel"] = this.spawnTemporaryChannel;

		context.client.on("voiceStateUpdate", this.deleteEmptyChannel);
	}

	deleteEmptyChannel(oldVoiceState: VoiceState): void {
		if (oldVoiceState.channel && oldVoiceState.channel.name.match(this.config.name_regex) != null && oldVoiceState.channel.members.size == 0 && oldVoiceState.channel.deletable) {
			oldVoiceState.channel.delete();
		}
	}

	spawnTemporaryChannel(eventData: CommunicationEvent): void {
		responseToQuestion(eventData)
			.then((chosenName: string) => eventData.guild.channels.create(`${chosenName} ${this.config.name_suffix}`, { type: "voice", bitrate: eventData.config.handlerSpecific.bitrate * 1000 })) // Make the voice channel
			.then(
				(channel: VoiceChannel) =>
					channel.guild
						.member(eventData.author)
						.voice.setChannel(channel)
						.catch((err) => this.context.console(`${err} (Attempted to move user to temporary voice channel)`, Vocab.Warn)) // Move the user
			);
	}

	extract(context: DiscordBot): void {
		delete context.handlers.temporary_voice_channel;
		context.client.off("voiceStateUpdate", this.deleteEmptyChannel);
	}
}
