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
		context.client.on("presenceUpdate", (oldPresence, newPresence) => {
			if (
				getPropertySafe(oldPresence, ["activity", "name"]) == getPropertySafe(newPresence, ["activity", "name"]) || // they haven't changed games
				oldPresence.user.bot || // they're a bot
				!oldPresence.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			oldPresence.member.roles
				.filter((role) => role.name.startsWith(this.config.role_prefix))
				.forEach((gameRole) => {
					oldPresence.member.roles
						.remove(gameRole)
						.catch((reason) => context.console(ErrorLevels.Error, `Error removing role ${roleStringify(gameRole)}. (${reason})`))
						.then(() => {
							if (gameRole.members.size == 0 && !(gameRole as any).deleted) gameRole.delete().catch((reason) => context.console(ErrorLevels.Error, `Error deleting role ${roleStringify(gameRole)}. (${reason})`));
						})
						.catch((reason) => context.console(ErrorLevels.Error, reason));
				});

			if (newPresence.activity != null) {
				new Promise((resolve) => {
					let gameRole = newPresence.guild.roles.filter((role) => role.name == this.config.role_prefix.concat(newPresence.activity.name)).first();
					if (gameRole) resolve(gameRole);
					else resolve(newPresence.member.guild.roles.create({ data: { name: this.config.role_prefix.concat(newPresence.activity.name), mentionable: true } }));
				}).then((role: Role) => newPresence.member.roles.add(role).catch((reason) => context.console(ErrorLevels.Error, `Error adding role ${roleStringify(role)}. (${reason})`)));
			}
		});
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((role) => role.delete()));
	}
}
