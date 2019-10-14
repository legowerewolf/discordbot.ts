import { GuildMember, VoiceChannel } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { responseToQuestion } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

const nameSuffix = "🤖";
const nameRegex = new RegExp(`[\\w ]* ${nameSuffix}$`, "g");

export default class TemporaryVoiceChannel extends Plugin {
	inject(context: DiscordBot) {
		context.handlers["temporary_voice_channel"] = (eventData: CommunicationEvent) => {
			responseToQuestion(eventData)
				.then((chosenName: string) => eventData.guild.createChannel(`${chosenName} ${nameSuffix}`, { type: "voice", bitrate: eventData.config.handlerSpecific.bitrate * 1000 })) // Make the voice channel
				.then(
					(channel: VoiceChannel) =>
						channel.guild
							.member(eventData.author)
							.setVoiceChannel(channel)
							.catch((err) => context.console(ErrorLevels.Error, err)) // Move the user
				);
		};

		context.client.on("voiceStateUpdate", (memberOldStatus: GuildMember, memberNewStatus: GuildMember) => {
			if (memberOldStatus.voiceChannel && memberOldStatus.voiceChannel.name.match(nameRegex) != null && memberOldStatus.voiceChannel.members.size == 0 && memberOldStatus.voiceChannel.deletable) {
				memberOldStatus.voiceChannel.delete();
			}
		});
	}

	extract(context: DiscordBot) {}
}
