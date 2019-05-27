import { GuildMember, VoiceChannel } from "discord.js";
import { DiscordBot } from "../discordbot";
import { Plugin } from "../types";

const indexableChannelRegex = /([\w ]+) (\d+)/;

export default class VoiceScaling extends Plugin {
	inject(context: DiscordBot) {
		// Register a handler for guildmembers joining/leaving/switching voice channels.
		context.client.on("voiceStateUpdate", (memberOldStatus: GuildMember, memberNewStatus: GuildMember) => {
			// Construct an array of the channels they joined and left, and iterate over it.
			[memberOldStatus.voiceChannel, memberNewStatus.voiceChannel].forEach((channel) => {
				if (!channel || channel.name.match(indexableChannelRegex) == null) return;

				let emptyChannelDuplicates = this.findDuplicateChannels(channel).filter((x) => x.members.size == 0);
				if (emptyChannelDuplicates.length == 0) channel.clone(this.newNameFromExisting(channel)).then((newChannel) => newChannel.setParent(channel.parentID));
				else
					emptyChannelDuplicates.forEach((chan, index) => {
						if (index > 0) chan.delete();
					});
			});
		});
	}

	// Identify all voice channels in the same category (or the root) with the same name.
	findDuplicateChannels(channel: VoiceChannel): Array<VoiceChannel> {
		return (channel.guild.channels.array().filter((x) => x.type == "voice" && x.parentID == channel.parentID) as Array<VoiceChannel>)
			.filter((x) => x.name.match(indexableChannelRegex) != null) // Filter out channels that aren't indexable
			.filter((x) => x.name.match(indexableChannelRegex)[1] == channel.name.match(indexableChannelRegex)[1]) // Filter out channels that aren't part of the same group
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	// Get the numbers of all channels with the same name
	getDuplicateChannelIDs(channel: VoiceChannel): number[] {
		return this.findDuplicateChannels(channel).map((c) => Number(c.name.match(indexableChannelRegex)[2]));
	}

	// Get a new channel number suffix
	newIndex(primaryKeys: Array<number>): number {
		return primaryKeys.reduce((accum, curr) => {
			return accum == curr ? curr + 1 : accum;
		}, 1);
	}

	// Generate a new name from the name of an existing channel.
	newNameFromExisting(channel: VoiceChannel) {
		return `${channel.name.match(indexableChannelRegex)[1]} ${this.newIndex(this.getDuplicateChannelIDs(channel))}`;
	}

	extract(context: DiscordBot) {}
}
