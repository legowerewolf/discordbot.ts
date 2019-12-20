import { Role } from "discord.js";
import { DiscordBot } from "../discordbot";
import { memberStringify, promiseRetry, roleStringify } from "../helpers";
import { CommunicationEvent, Plugin, Vocab } from "../types";

export default class PresenceRoles extends Plugin {
	// Built-in defaults - the minimum needed for the plugin to work.
	static defaultConfig = {
		role_prefix: "in:",
	};

	inject(context: DiscordBot) {
		context.client.on("presenceUpdate", (oldPresence, newPresence) => {
			if (
				oldPresence?.activity?.applicationID === newPresence.activity?.applicationID || // they haven't changed games
				newPresence.user.bot || // they're a bot
				!newPresence.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
			)
				return;

			context.console(`Updating roles for member ${memberStringify(newPresence.member)} (game switch from "${oldPresence?.activity?.name}" to "${newPresence?.activity?.name}")`, Vocab.Info);

			let userID = newPresence.user.id ?? oldPresence.user.id;
			let guildID = newPresence.guild.id ?? oldPresence.guild.id;
			let updatedMember = () => context.client.guilds.get(guildID).members.get(userID);
			let updatedRole = (id: string) => updatedMember().guild.roles.get(id);

			if (oldPresence != undefined)
				oldPresence.member.roles
					.filter((role) => role.name.startsWith(this.config.role_prefix))
					.forEach((gameRole) => {
						promiseRetry(
							() => {
								return updatedMember().roles.get(gameRole.id) ? updatedMember().roles.remove(gameRole) : Promise.resolve();
							},
							{
								warnMsg: `removing role ${roleStringify(gameRole)} from user ${memberStringify(newPresence.member)}.`,
								console: (msg) => {
									context.console(msg, Vocab.Warn);
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
										context.console(msg, Vocab.Warn);
									},
								}
							);
						});
					});

			if (newPresence?.activity != null) {
				promiseRetry(
					() => {
						return new Promise((resolve, reject) => {
							let member = updatedMember(); // Resolve the current version of the Member once.
							if (!member.presence?.activity) reject("Not playing game any longer");
							resolve(
								member.guild.roles.filter((role) => role.name === this.config.role_prefix.concat(member.presence.activity.name)).first() ??
									member.guild.roles.create({ data: { name: this.config.role_prefix.concat(member.presence.activity.name), mentionable: true } })
							);
						}).then(
							(role: Role) => newPresence.member.roles.add(role),
							(reason) => {
								if (reason != "Not playing game any longer") return Promise.reject(reason);
							}
						);
					},
					{
						warnMsg: `adding role for game ${newPresence?.activity?.name} to member ${memberStringify(newPresence.member)}`,
						console: (msg) => {
							context.console(msg, Vocab.Warn);
						},
					}
				);
			}
		});

		context.handlers["purge_gameroles"] = (eventData: CommunicationEvent) => {
			eventData.responseCallback(`Purging game roles from this server.`);
			eventData.guild.roles
				.filter((role) => role.name.startsWith(this.config.role_prefix))
				.forEach((gameRole) => {
					promiseRetry(
						() => {
							return context.client.guilds.get(eventData.guild.id).roles.get(gameRole.id) != undefined ? gameRole.delete() : Promise.resolve();
						},
						{
							warnMsg: `deleting role ${roleStringify(gameRole)}.`,
							console: (msg) => {
								context.console(msg, Vocab.Warn);
							},
						}
					);
				});
		};
	}

	extract(context: DiscordBot) {
		context.client.guilds.forEach((guild) => guild.roles.filter((role) => role.name.startsWith(this.config.role_prefix)).forEach((role) => role.delete()));
	}
}
