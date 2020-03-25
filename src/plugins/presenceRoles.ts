import { Activity, GuildMember, Presence, Role } from "discord.js";
import { checkContext, memberStringify, roleStringify } from "../helpers/helpers";
import { promiseRetry } from "../helpers/promiseRetry";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

export const getGame = (activities: Activity[]): Activity => activities?.filter((activity) => activity.type === "PLAYING")[0];

interface Config {
	rolePrefix: string;
}

export default class PresenceRoles extends Plugin<Config> {
	// Built-in defaults - the minimum needed for the plugin to work.
	static defaultConfig: Config = {
		rolePrefix: "in:",
	};

	context: DiscordBot;

	inject(context: DiscordBot): void {
		this.context = context;

		context.client.on("presenceUpdate", (o, n) => this.fixPresences(o, n));

		context.handlers = {
			...context.handlers,
			purgeGameroles: checkContext("server", this.removeRolesFromServer.bind(this)),
		};
	}

	fixPresences(oldPresence: Presence, newPresence: Presence): void {
		if (
			getGame(oldPresence?.activities)?.applicationID === getGame(newPresence.activities)?.applicationID || // they haven't changed games
			newPresence.user.bot || // they're a bot
			!newPresence.guild.me.hasPermission("MANAGE_ROLES") // I can't mess with roles on this server
		)
			return;

		this.context.console(`Updating roles for member ${memberStringify(newPresence.member)} (game switch from "${getGame(oldPresence?.activities)?.name}" to "${getGame(newPresence?.activities)?.name}")`, Vocab.Info);

		const userID = newPresence.user.id ?? oldPresence.user.id;
		const guildID = newPresence.guild.id ?? oldPresence.guild.id;
		const updatedMember = (): GuildMember => this.context.client.guilds.resolve(guildID).members.resolve(userID);
		const updatedRole = (id: string): Role => updatedMember().guild.roles.resolve(id);

		if (getGame(oldPresence?.activities) != null)
			oldPresence.member.roles.cache
				.filter((role) => role.name.startsWith(this.config.rolePrefix))
				.forEach((gameRole) => {
					promiseRetry(
						() => {
							return updatedMember().roles.cache.has(gameRole.id) ? updatedMember().roles.remove(gameRole) : Promise.resolve(updatedMember());
						},
						{
							description: `removing role ${roleStringify(gameRole)} from user ${memberStringify(newPresence.member)}.`,
							console: this.context.console,
						}
					).then(() => {
						promiseRetry(
							() => {
								return updatedRole(gameRole.id) != undefined && updatedRole(gameRole.id).members.size == 0 ? updatedRole(gameRole.id).delete() : Promise.resolve(updatedRole(gameRole.id));
							},
							{
								description: `deleting role ${roleStringify(gameRole)}.`,
								console: this.context.console,
							}
						);
					});
				});

		if (getGame(newPresence?.activities) != null) {
			promiseRetry(
				() => {
					return new Promise((resolve, reject) => {
						const member = updatedMember(); // Resolve the current version of the Member once.
						if (!getGame(member.presence?.activities)) reject("Not playing game any longer");
						resolve(
							member.guild.roles.cache.filter((role) => role.name === this.config.rolePrefix.concat(getGame(member.presence?.activities).name)).first() ??
								member.guild.roles.create({ data: { name: this.config.rolePrefix.concat(getGame(member.presence?.activities).name), mentionable: true } })
						);
					}).then(
						(role: Role) => newPresence.member.roles.add(role),
						(reason) => {
							if (reason != "Not playing game any longer") return Promise.reject(reason);
						}
					);
				},
				{
					description: `adding role for game ${getGame(newPresence?.activities)?.name} to member ${memberStringify(newPresence.member)}`,
					console: this.context.console,
				}
			);
		}
	}

	removeRolesFromServer(eventData: CommunicationEvent): void {
		eventData.responseCallback(`Purging game roles from this server.`);
		eventData.guild.roles.cache
			.filter((role) => role.name.startsWith(this.config.rolePrefix))
			.forEach((gameRole) => {
				promiseRetry(
					() => {
						return eventData.client.guilds.resolve(eventData.guild.id).roles.resolve(gameRole.id) != undefined ? gameRole.delete() : Promise.resolve(gameRole);
					},
					{
						description: `deleting role ${roleStringify(gameRole)}.`,
						console: eventData.bot.console,
					}
				);
			});
	}

	extract(): void {
		this.context.client.off("presenceUpdate", this.fixPresences);

		delete this.context.handlers.purge_gameroles;

		this.context.client.guilds.cache.forEach((guild) => guild.roles.cache.filter((role) => role.name.startsWith(this.config.rolePrefix)).forEach((role) => role.delete()));

		this.context = undefined;
	}
}
