import { VoiceChannel, VoiceState } from "discord.js";
import { checkContext, responseToQuestion } from "../helpers/helpers";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

interface Config {
	nameSuffix: string;
}

export default class TemporaryVoiceChannel extends Plugin<Config> {
	nameRegex: RegExp;
	context: DiscordBot;

	static defaultConfig: Config = {
		nameSuffix: "🤖",
	};

	constructor(_config?: Config) {
		super(_config);
		this.nameRegex = new RegExp(`[\\w ]* ${this.config.nameSuffix}$`, "g");
	}

	inject(context: DiscordBot): void {
		this.context = context;

		context.handlers = {
			...context.handlers,
			temporaryVoiceChannel: checkContext("server", this.spawnTemporaryChannel.bind(this)),
		};

		context.client.on("voiceStateUpdate", (o) => this.deleteEmptyChannel(o));
	}

	deleteEmptyChannel(oldVoiceState: VoiceState): void {
		if (oldVoiceState.channel && oldVoiceState.channel.name.match(this.nameRegex) != null && oldVoiceState.channel.members.size == 0 && oldVoiceState.channel.deletable) {
			oldVoiceState.channel.delete();
		}
	}

	spawnTemporaryChannel(eventData: CommunicationEvent): void {
		responseToQuestion(eventData)
			.then((chosenName: string) => eventData.guild.channels.create(`${chosenName} ${this.config.nameSuffix}`, { type: "voice", bitrate: eventData.config.handlerSpecific.bitrate * 1000 })) // Make the voice channel
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
