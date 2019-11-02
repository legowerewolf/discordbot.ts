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
		context.client.on("presenceUpdate", (oldPresence, newPresence) => {
			if (
				getPropertySafe(oldPresence, ["activity", "name"]) == getPropertySafe(newPresence, ["activity", "name"]) || // they haven't changed games
				oldPresence.user.bot || // they're a bot
				!oldPresence.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			let updatedMember = () => context.client.guilds.get(newPresence.guild.id).members.get(newPresence.user.id);

			oldPresence.member.roles
				.filter((role) => role.name.startsWith(this.config.role_prefix))
				.forEach((gameRole) => {
					promiseRetry(
						() => {
							return updatedMember().roles.get(gameRole.id) ? updatedMember().roles.remove(gameRole) : Promise.resolve();
						},
						{
							warnMsg: `Error removing role ${roleStringify(gameRole)} from user ${memberStringify(oldPresence.member)}.`,
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
								warnMsg: `Error deleting role ${roleStringify(gameRole)}.`,
								console: (msg) => {
									context.console(ErrorLevels.Warn, msg);
								},
							}
						);
					});
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
