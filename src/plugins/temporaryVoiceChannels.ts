import { VoiceChannel, VoiceState } from "discord.js";
import { checkContext } from "../helpers/checkContext";
import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import Duration from "../typedef/Duration";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

interface Config {
	/** Symbol/text appended to the end of the names of channels spawned by this plugin */
	nameSuffix: string;

	/** Default bitrate (kbps) */
	bitrate: number;

	/** Time a user has to join a new temporary channel before it's deleted */
	manualSwitchTimeout: Duration;
}

/**
 * Manages temporary channels created on request.
 *
 * Temporary channels only exist as long as a person is using them.
 */
export default class TemporaryVoiceChannel extends Plugin<Config> {
	/**
	 * Regular expression used to identify channels spawned by this plugin
	 *
	 * Computed/generated once, in the constructor
	 */
	private nameRegex: RegExp;

	static defaultConfig: Config = {
		nameSuffix: "🤖",
		bitrate: 16,
		manualSwitchTimeout: new Duration("1m"),
	};

	constructor(context: DiscordBot, _config?: Config) {
		super(context, _config);
		if (_config.manualSwitchTimeout) this.config.manualSwitchTimeout = new Duration(_config.manualSwitchTimeout);

		this.nameRegex = new RegExp(`[\\w ]* ${this.config.nameSuffix}$`, "g");
	}

	inject(context: DiscordBot): void {
		this.declareHandler("temporaryVoiceChannel", checkContext("server", this.spawnTemporaryChannel.bind(this)));

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
						eventData.bot.console(`${err} (Attempted to move user to temporary voice channel)`, Vocab.Warn);

						// Delete the channel if it's empty after a certain duration
						setTimeout(async () => {
							const u = (await channel.fetch()) as VoiceChannel;
							if (u.members.size == 0 && u.deletable) u.delete();
						}, this.config.manualSwitchTimeout.ms);
					})
			);
	}

	extract(context: DiscordBot): void {
		this.clearHandlers();
		context.client.off("voiceStateUpdate", this.deleteEmptyChannel);
	}
}
