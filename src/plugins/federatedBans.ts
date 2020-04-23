import { Guild, User } from "discord.js";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class FederatedBansPlugin extends Plugin<never> {
	inject(context: DiscordBot): void {
		context.client.on("guildBanAdd", async (g: Guild, u: User) => {
			const ban = await g.fetchBan(u);

			context.persister.writeUser(u.id, {
				bans: {
					[g.id]: ban.reason ?? "",
				},
			});
		});

		context.client.on("guildBanRemove", async (g: Guild, u: User) => {
			context.persister.writeUser(u.id, {
				bans: {
					[g.id]: null,
				},
			});
		});

		context.client.guilds.cache.each((guild) => {
			guild.fetchBans().then((bans) => {
				bans.forEach((ban) => {
					context.persister.writeUser(ban.user.id, {
						bans: {
							[guild.id]: ban.reason ?? "",
						},
					});
				});
			});
		});
	}

	extract(): void {
		this.clearHandlers();
	}
}
