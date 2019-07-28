import { Role } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { getPropertySafe } from "../helpers";
import { Plugin } from "../types";

const role_prefix = "in:";

export default class PresenceRoles extends Plugin {
	inject(context: DiscordBot) {
		context.client.on("presenceUpdate", (oldMember, newMember) => {
			if (
				getPropertySafe(oldMember, ["presence", "game", "name"]) == getPropertySafe(newMember, ["presence", "game", "name"]) || // they haven't changed games
				oldMember.user.bot || // they're a bot
				!oldMember.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			oldMember.guild.roles
				.filter((role) => role.name.startsWith(role_prefix))
				.forEach((gameRole) => {
					oldMember
						.removeRole(gameRole)
						.catch((reason) => context.console(ErrorLevels.Error, `Error removing role. ${reason}, ${gameRole}`))
						.then(() => {
							if (gameRole.members.size == 0) gameRole.delete().catch((reason) => context.console(ErrorLevels.Error, `Error deleting role. ${reason}, ${gameRole}`));
						})
						.catch((reason) => context.console(ErrorLevels.Error, reason));
				});

			if (newMember.presence.game != null) {
				new Promise((resolve) => {
					let gameRole = newMember.guild.roles.filter((role) => role.name == role_prefix.concat(newMember.presence.game.name)).first();
					if (gameRole) resolve(gameRole);
					resolve(newMember.guild.createRole({ name: role_prefix.concat(newMember.presence.game.name), mentionable: true }));
				})
					.then((role: Role) => newMember.addRole(role))
					.catch((reason) => context.console(ErrorLevels.Error, `Error adding role. ${reason}`));
			}
		});
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(role_prefix)).forEach((role) => role.delete()));
	}
}
