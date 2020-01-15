import { Guild, TextChannel } from "discord.js";
import { DiscordBot } from "../discordbot";
import { Plugin } from "../types";

export default class ArchiverPlugin extends Plugin {
	static defaultConfig = {
		age: "30d",
		cycle: "1h",
	};

	inject(context: DiscordBot) {}

	extract() {}

	static serializeChannelData(channel: TextChannel) {
		return JSON.stringify({
			guild: {
				name: channel.guild.name,
				id: channel.guild.id,
			},
			category: {
				name: channel.parent?.name,
				id: channel.parent?.id,
			},
		});
	}

	createArchiveCategory(guild: Guild) {
		return guild.channels.create("Archive", {
			type: "category",
			topic: "This category exists to contain channels that haven't been used in awhile.",
			permissionOverwrites: [
				{
					id: guild.roles.everyone,
					deny: ["SEND_MESSAGES"],
				},
			],
		});
	}
}
