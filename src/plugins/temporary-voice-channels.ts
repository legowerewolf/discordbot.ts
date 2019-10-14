import { GuildMember, VoiceChannel } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { responseToQuestion } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class TemporaryVoiceChannel extends Plugin {
	static defaultConfig = {
		name_suffix: "🤖",
	};

	constructor(_config?: any) {
		super(_config);
		this.config.name_regex = new RegExp(`[\\w ]* ${this.config.name_suffix}$`, "g");
	}

	inject(context: DiscordBot) {
		context.handlers["temporary_voice_channel"] = (eventData: CommunicationEvent) => {
			responseToQuestion(eventData)
				.then((chosenName: string) => eventData.guild.createChannel(`${chosenName} ${this.config.name_suffix}`, { type: "voice", bitrate: eventData.config.handlerSpecific.bitrate * 1000 })) // Make the voice channel
				.then(
					(channel: VoiceChannel) =>
						channel.guild
							.member(eventData.author)
							.setVoiceChannel(channel)
							.catch((err) => context.console(ErrorLevels.Error, `${err} (Attempted to move user to temporary voice channel)`)) // Move the user
				);
		};

		context.client.on("voiceStateUpdate", (memberOldStatus: GuildMember, memberNewStatus: GuildMember) => {
			if (memberOldStatus.voiceChannel && memberOldStatus.voiceChannel.name.match(this.config.name_regex) != null && memberOldStatus.voiceChannel.members.size == 0 && memberOldStatus.voiceChannel.deletable) {
				memberOldStatus.voiceChannel.delete();
			}
		});
	}

	extract(context: DiscordBot) {}
}
