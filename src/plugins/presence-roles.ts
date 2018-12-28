
import { GuildMember, Role } from "discord.js";
import { ErrorLevels } from "legowerewolf-prefixer";
import { DiscordBot } from "../discordbot";
import { Plugin } from "../types";


export default class PresenceRoles extends Plugin {

    inject(context: DiscordBot) {
        context.client.on("presenceUpdate",

            (oldMember: GuildMember, member: GuildMember) => {
                let guild = oldMember.guild;
                let gameRoles = guild.roles.filter((value: Role) => value.name.startsWith("in:"));
                if (guild.me.permissions.has("MANAGE_ROLES") && oldMember.presence.game != member.presence.game && !member.user.bot) {

                    let instance = Math.random();

                    let currentGame = member.presence.game;
                    if (currentGame != null) {
                        new Promise((resolve, reject) => { // Find or make the role
                            let r = gameRoles.find((value: Role) => value.name == `in:${currentGame.name}`);
                            resolve(r != null ? r : guild.createRole({ name: `in:${currentGame.name}`, mentionable: true })
                                .then((role) => {
                                    context.console(ErrorLevels.Info, `Created role: ${role.guild.name}/${role.name} (instance: ${instance})`);
                                    return Promise.resolve(role);
                                }, (error) => {
                                    context.console(ErrorLevels.Error, "Error on role creation.");
                                    context.console(ErrorLevels.Error, `${error}`);
                                    return Promise.resolve(error);
                                }));
                        })
                            .then((role: Role) => { // Assign the user to the role
                                member.addRole(role)
                                    .then((user) => {
                                        context.console(ErrorLevels.Info, `Added role to user: ${role.guild.name}/${role.name} to ${user.displayName} (instance: ${instance})`);
                                    }, (error) => {
                                        context.console(ErrorLevels.Error, `Error on role assignment. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                        context.console(ErrorLevels.Error, `${error}`);
                                    })
                            })

                    }

                    //Clean up other roles
                    member.roles.filter((value: Role) => value.name.startsWith("in:") && (currentGame != null ? value.name != `in:${currentGame.name}` : true)).forEach((role) => {
                        member.removeRole(role)
                            .then((member) => {
                                if (role.members.size == 0) {
                                    role.delete().then(() => {
                                        context.console(ErrorLevels.Info, `Deleted role: ${role.guild.name}/${role.name} (instance: ${instance})`);
                                    }, (error) => {
                                        context.console(ErrorLevels.Error, `Error on role deletion. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                        context.console(ErrorLevels.Error, `${error}`);
                                    });
                                }
                            })
                            .then(() => {
                                context.console(ErrorLevels.Info, `Removed role from user: ${role.guild.name}/${role.name} from ${member.displayName} (instance: ${instance})`);
                            }, (error) => {
                                context.console(ErrorLevels.Error, `Error on role removal. ${role.guild.name}/${role.name} (${role}, deleted: ${(role as any).deleted}, instance: ${instance})`);
                                context.console(ErrorLevels.Error, `${error}`);
                            })

                    })
                }
            });
    }
}
