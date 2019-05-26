import { GuildMember, VoiceChannel } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { Plugin } from "../types";

const indexableChannelRegex = /([\w ]+) (\d+)/;

export default class PresenceRoles extends Plugin {
	inject(context: DiscordBot) {
		context.client.on("voiceStateUpdate", (memberOldStatus: GuildMember, memberNewStatus: GuildMember) => {
			if (memberNewStatus.voiceChannel !== undefined && memberNewStatus.voiceChannel.name.match(indexableChannelRegex) != null) {
				// The user has joined an indexed channel.
				context.console(ErrorLevels.Info, `${memberNewStatus} joined an indexed channel`);

				let newChannel: VoiceChannel = memberNewStatus.voiceChannel;

				if (newChannel.members.size == 1) {
					// Only if this is the first person in the channel

					newChannel
						.clone(this.newNameFromExisting(newChannel)) // Clone the channel
						.then((channel) => channel.setParent(newChannel.parentID)); // Move it to the appropriate category
				}
			}

			if (memberOldStatus.voiceChannel !== undefined && memberOldStatus.voiceChannel.name.match(indexableChannelRegex) != null) {
				// The user in question has switched away from an indexed channel.
				context.console(ErrorLevels.Info, `${memberNewStatus} left an indexed channel`);

				let oldChannel: VoiceChannel = memberOldStatus.voiceChannel;

				if (oldChannel.members.size == 0) {
					let duplicateIDCount = this.getDuplicateIDs(oldChannel).length;
					if (duplicateIDCount > 1) {
						oldChannel.delete();
					} else if (duplicateIDCount == 1) {
						oldChannel.setName(this.newNameFromExisting(oldChannel, 1));
					}
				}
			}
		});
	}

	findDuplicates(channel: VoiceChannel): Array<VoiceChannel> {
		return (channel.parent.children //@todo: crashes if channel is not in a category
			.array() as Array<VoiceChannel>)
			.filter((x) => x.name.match(indexableChannelRegex) != null) // Filter out channels that aren't indexable
			.filter((x) => x.name.match(indexableChannelRegex)[1] == channel.name.match(indexableChannelRegex)[1]); // Filter out channels that aren't part of the same group
	}

	getDuplicateIDs(channel: VoiceChannel): number[] {
		// Get the numbers of all channels with the same name
		return this.findDuplicates(channel).map((c) => Number(c.name.match(indexableChannelRegex)[2]));
	}

	getNewPrimaryKey(primaryKeys: Array<number>): number {
		// Get a new channel number suffix
		return primaryKeys.reduce((accum, curr) => {
			return accum == curr ? curr + 1 : accum;
		}, 1);
	}

	getEmptyDuplicateChannelsCount(channels: Array<VoiceChannel>): number {
		// Get a count of all the duplicate channels with no current members
		return channels.map((c) => c.members.size).reduce((prev, cur) => (cur == 0 ? prev + 1 : prev));
	}

	newNameFromExisting(channel: VoiceChannel, number: number = null) {
		return `${channel.name.match(indexableChannelRegex)[1]} ${number == null ? this.getNewPrimaryKey(this.getDuplicateIDs(channel)) : number}`;
	}

	extract(context: DiscordBot) {}
}
