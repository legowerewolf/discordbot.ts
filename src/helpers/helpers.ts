import { CoreProperties } from "@schemastore/package";
import { GuildMember, Role } from "discord.js";
import { readFile } from "fs";
import { safeLoad } from "js-yaml";
import { promisify } from "util";
import { Dictionary } from "../typedef/Dictionary";
import { ResolutionMethods } from "../typedef/ResolutionMethods";

export const readFileP = promisify(readFile);

export const META_VERSION = readFileP("./package.json")
	.then((data) => safeLoad(data.toString()))
	.then((data: CoreProperties) => data.version);

const getHash = (ref: string, short = true): Promise<string> =>
	readFileP(`./.git/refs/${ref}`)
		.then((chunk) => chunk.toString())
		.then((hash) => (short ? hash.substr(0, 8) : hash));

export const META_HASH = getHash("heads/master", true);

export function resolveConflict<T>(method: ResolutionMethods, defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> {
	const m = {
		[ResolutionMethods.UseDefault]: (defaults: Dictionary<T>): Dictionary<T> => defaults,
		[ResolutionMethods.UseCustom]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => custom,
		[ResolutionMethods.MergePreferCustom]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => {
			return { ...defaults, ...custom };
		},
		[ResolutionMethods.MergePreferDefault]: (defaults: Dictionary<T>, custom: Dictionary<T>): Dictionary<T> => {
			return { ...custom, ...defaults };
		},
	};

	return m[method](defaults, custom);
}

export function roleStringify(role: Role): string {
	return `{name: ${role.name}, id: ${role.id}, guild: ${role.guild.id}, editable?: ${role.editable}}`;
}

export function memberStringify(member: GuildMember): string {
	return `{name: ${member.displayName}, id: ${member.id}, guild: ${member.guild.id}}`;
}
