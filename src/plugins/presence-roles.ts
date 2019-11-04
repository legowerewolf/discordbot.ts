import { Role } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { getPropertySafe, memberStringify, promiseRetry, roleStringify } from "../helpers";
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

			let updatedMember = () => context.client.guilds.get(newMember.guild.id).members.get(newMember.user.id);

			oldMember.roles
				.filter((role) => role.name.startsWith(this.config.role_prefix))
				.forEach((gameRole) => {
					promiseRetry(
						() => {
							return updatedMember().roles.get(gameRole.id) ? updatedMember().removeRole(gameRole) : Promise.resolve();
						},
						{
							warnMsg: `removing role ${roleStringify(gameRole)} from user ${memberStringify(oldMember)}.`,
							console: (msg) => {
								context.console(ErrorLevels.Warn, msg);
							},
						}
					).then(() => {
						promiseRetry(
							() => {
								let currentRole = updatedMember().guild.roles.get(gameRole.id);
								return currentRole != undefined && currentRole.members.size == 0 ? currentRole.delete() : Promise.resolve();
							},
							{
								warnMsg: `deleting role ${roleStringify(gameRole)}.`,
								console: (msg) => {
									context.console(ErrorLevels.Warn, msg);
								},
							}
						);
					});
				});

			if (newMember.presence.game != null) {
				new Promise((resolve) => {
					let gameRole = newMember.guild.roles.filter((role) => role.name == this.config.role_prefix.concat(newMember.presence.game.name)).first();
					if (gameRole) resolve(gameRole);
					else resolve(newMember.guild.createRole({ name: this.config.role_prefix.concat(newMember.presence.game.name), mentionable: true }));
				}).then((role: Role) => newMember.addRole(role).catch((reason) => context.console(ErrorLevels.Error, `Error adding role ${roleStringify(role)}. (${reason})`)));
			}
		});
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((role) => role.delete()));
	}
}
