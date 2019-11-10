import { Role } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { memberStringify, promiseRetry, roleStringify } from "../helpers";
import { CommunicationEvent, Plugin } from "../types";

export default class PresenceRoles extends Plugin {
	// Built-in defaults - the minimum needed for the plugin to work.
	static defaultConfig = {
		role_prefix: "in:",
	};

	inject(context: DiscordBot) {
		context.client.on("presenceUpdate", (oldMember, newMember) => {
			if (
				oldMember?.presence?.game?.name === newMember?.presence?.game?.name || // they haven't changed games
				oldMember.user.bot || // they're a bot
				!oldMember.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			context.console(ErrorLevels.Info, `Updating roles for member ${memberStringify(newMember)} (game switch from "${oldMember?.presence?.game?.name}" to "${newMember?.presence?.game?.name}")`);

			let updatedMember = () => context.client.guilds.get(newMember.guild.id).members.get(newMember.user.id);
			let updatedRole = (id: string) => updatedMember().guild.roles.get(id);

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
								return updatedRole(gameRole.id) != undefined && updatedRole(gameRole.id).members.size == 0 ? updatedRole(gameRole.id).delete() : Promise.resolve();
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
				promiseRetry(() => {
					return new Promise((resolve, reject) => {
						if (!(updatedMember().presence?.game?.name)) reject("Not playing game any longer");
						resolve(
							updatedMember().guild.roles.filter((role) => role.name === this.config.role_prefix.concat(updatedMember().presence.game.name)).first() ??
							updatedMember().guild.createRole({ name: this.config.role_prefix.concat(updatedMember().presence.game.name), mentionable: true })
						);
					}).then((role: Role) => newMember.addRole(role), (reason) => { if (reason != "Not playing game any longer") return Promise.reject(reason) });
				},
					{
						warnMsg: `adding role for game ${newMember.presence?.game?.name} to member ${memberStringify(newMember)}`,
						console: (msg) => {
							context.console(ErrorLevels.Warn, msg);
						}
					}
				);
			}

		});

		context.handlers["purge_gameroles"] = (eventData: CommunicationEvent) => {
			eventData.responseCallback(`Purging game roles from this server.`);
			eventData.guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((gameRole) => {
				promiseRetry(
					() => {
						return context.client.guilds.get(eventData.guild.id).roles.get(gameRole.id) != undefined ? gameRole.delete() : Promise.resolve();
					},
					{
						warnMsg: `deleting role ${roleStringify(gameRole)}.`,
						console: (msg) => {
							context.console(ErrorLevels.Warn, msg);
						},
					}
				);
			})
		 }
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((role) => role.delete()));
	}
}
