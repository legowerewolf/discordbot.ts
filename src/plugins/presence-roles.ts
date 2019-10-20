import { Role } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { getPropertySafe, roleStringify } from "../helpers";
import { Plugin } from "../types";

export default class PresenceRoles extends Plugin {
	// Built-in defaults - the minimum needed for the plugin to work.
	static defaultConfig = {
		role_prefix: "in:",
	};

	inject(context: DiscordBot) {
		context.client.on("presenceUpdate", (oldMember, newMember) => {
			if (
				getPropertySafe(oldMember, ["presence", "game", "name"]) == getPropertySafe(newMember, ["presence", "game", "name"]) || // they haven't changed games
				oldMember.user.bot || // they're a bot
				!oldMember.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			oldMember.guild.roles
				.filter((role) => role.name.startsWith(this.config.role_prefix))
				.forEach((gameRole) => {
					oldMember
						.removeRole(gameRole)
						.catch((reason) => context.console(ErrorLevels.Error, `Error removing role ${roleStringify(gameRole)}. (${reason})`))
						.then(() => {
							if (gameRole.members.size == 0 && !(gameRole as any).deleted) gameRole.delete().catch((reason) => context.console(ErrorLevels.Error, `Error deleting role ${roleStringify(gameRole)}. (${reason})`));
						})
						.catch((reason) => context.console(ErrorLevels.Error, reason));
				});

			if (newMember.presence.game != null) {
				new Promise((resolve) => {
					resolve(
						newMember.guild.roles.filter((role) => role.name == this.config.role_prefix.concat(newMember.presence.game.name)).first() ||
							newMember.guild.createRole({ name: this.config.role_prefix.concat(newMember.presence.game.name), mentionable: true })
					);
				}).then((role: Role) => newMember.addRole(role).catch((reason) => context.console(ErrorLevels.Error, `Error adding role ${roleStringify(role)}. (${reason})`)));
			}
		});
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((role) => role.delete()));
	}
}
