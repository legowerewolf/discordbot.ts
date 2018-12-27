import { GuildMember, VoiceChannel } from "discord.js";
import { DiscordBot } from "../discordbot";
import { Plugin } from "../types";

const indexableChannelRegex = /([\w ]+) (\d+)/;

export default class PresenceRoles extends Plugin {

    inject(context: DiscordBot) {
        context.client.on("voiceStateUpdate", (memberOldStatus: GuildMember, memberNewStatus: GuildMember) => {

            if (memberNewStatus.voiceChannel !== undefined) {
                let x: VoiceChannel = memberNewStatus.voiceChannel;
                console.log(`${memberNewStatus} joined a channel`)

                if (x.members.size == 1 && x.name.match(indexableChannelRegex) != null) { // Only if this is the first person in the channel AND it's an indexable channel
                    x.clone(`${x.name.match(indexableChannelRegex)[1]} ${this.getNewPrimaryKey(this.getDuplicateIDs(x))}`) // Clone the channel
                        .then((channel) => channel.setParent(x.parentID)); // Move it to the appropriate category
                }
            }

            if (memberOldStatus.voiceChannel !== undefined) {
                console.log(`${memberNewStatus} left a channel`)
                let x: VoiceChannel = memberOldStatus.voiceChannel;

                if (x.members.size == 0 && x.name.match(indexableChannelRegex) != null) {
                    if (this.getDuplicateIDs(x).length > 1) {
                        x.delete();
                    }
                }
            }
        })
    }

    findDuplicates(channel: VoiceChannel): Array<VoiceChannel> {
        return (channel.parent.children //@todo: crashes if channel is not in a category
            .array() as Array<VoiceChannel>)
            .filter(x => x.name.match(indexableChannelRegex) != null) // Filter out channels that aren't indexable
            .filter(x => x.name.match(indexableChannelRegex)[1] == channel.name.match(indexableChannelRegex)[1]) // Filter out channels that aren't part of the same group
    }

    getDuplicateIDs(channel: VoiceChannel) {
        return this.findDuplicates(channel).map(c => Number(c.name.match(indexableChannelRegex)[2]))
    }

    getNewPrimaryKey(primaryKeys: Array<number>) {
        return primaryKeys.reduce((accum, curr) => { return accum == curr ? curr + 1 : accum }, 1)
    }

    getEmptyDuplicateChannelsCount(channels: Array<VoiceChannel>) {
        return channels.map(c => c.members.size).reduce((prev, cur) => cur == 0 ? prev + 1 : prev)
    }
}