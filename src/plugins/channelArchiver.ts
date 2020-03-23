import { CategoryChannel, Guild, TextChannel } from "discord.js";
import { Plugin } from "../typedef/Plugin";

interface Config {
	age: string;
	cycle: string;
	archiveCategoryName: string;
}

export default class ArchiverPlugin extends Plugin<Config> {
	static defaultConfig = {
		age: "30d",
		cycle: "1h",
		archiveCategoryName: "Archive",
	};

	inject(): void {}

	extract(): void {}

	static serializeChannelData(channel: TextChannel): string {
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

	getArchiveCategory(guild: Guild): Promise<CategoryChannel> {
		const result = guild.channels.cache.find((channel) => channel.type === "category" && channel.name === this.config.archiveCategoryName);
		return result ? Promise.resolve<CategoryChannel>(result as CategoryChannel) : this.createArchiveCategory(guild);
	}

	createArchiveCategory(guild: Guild): Promise<CategoryChannel> {
		return guild.channels.create(this.config.archiveCategoryName, {
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
