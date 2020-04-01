import { VoiceChannel, VoiceState } from "discord.js";
import { checkContext } from "../helpers/checkContext";
import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import Duration from "../typedef/Duration";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

interface Config {
	nameSuffix: string; // Symbol/text appended to the end of the names of channels spawned by this plugin
	bitrate: number; // Default bitrate (kbps)
	manualSwitchTimeout: Duration; // Time a user has to join a new temporary channel before it's deleted
}

/**
 * Manages temporary channels created on request.
 *
 * Temporary channels only exist as long as a person is using them.
 */
export default class TemporaryVoiceChannel extends Plugin<Config> {
	nameRegex: RegExp;
	context: DiscordBot;

	static defaultConfig: Config = {
		nameSuffix: "🤖",
		bitrate: 16,
		manualSwitchTimeout: new Duration("1m"),
	};

	constructor(_config?: Config) {
		super(_config);
		this.nameRegex = new RegExp(`[\\w ]* ${this.config.nameSuffix}$`, "g");
		this.config.manualSwitchTimeout = new Duration(_config.manualSwitchTimeout);
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
			.then((chosenName: string) => eventData.guild.channels.create(`${chosenName} ${this.config.nameSuffix}`, { type: "voice", bitrate: (eventData.config.handlerSpecific?.bitrate ?? this.config.bitrate) * 1000 })) // Make the voice channel
			.then((channel: VoiceChannel) =>
				channel.guild
					.member(eventData.author)
					.voice.setChannel(channel) // Try to move the user
					.catch((err) => {
						this.context.console(`${err} (Attempted to move user to temporary voice channel)`, Vocab.Warn);

						// Delete the channel if it's empty after a certain duration
						setTimeout(async () => {
							const u = (await channel.fetch()) as VoiceChannel;
							if (u.members.size == 0 && u.deletable) u.delete();
						}, this.config.manualSwitchTimeout.ms);
					})
			);
	}

	extract(context: DiscordBot): void {
		delete context.handlers.temporary_voice_channel;
		context.client.off("voiceStateUpdate", this.deleteEmptyChannel);
	}
}
